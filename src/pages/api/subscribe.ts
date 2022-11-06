import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next"

import { fauna, q } from '../../services/fauna';
import { stripe } from "../../services/stripe";
import { authOptions } from "./auth/[...nextauth]"

type User = {
  ref: {
    id: string;
  }, 
  data: {
    stripe_customer_id: string;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const session = await unstable_getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).end();
    }

    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    );

    let customerId = user.data.stripe_customer_id;

    if (!customerId) {

      const stripeCustomer = await stripe.customers.create({
        email: session?.user?.email,
      });

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id,
            }
          }
        )
      )

      customerId = stripeCustomer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: 'required',
      line_items: [
        { price: "price_1M0zbrKH8dNlHOzGt7mG8mBe", quantity: 1 },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL as string,
      cancel_url: process.env.STRIPE_CANCEL_URL as string,
    })

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}