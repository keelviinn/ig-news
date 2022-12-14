import { GetStaticProps } from "next";
import Head from "next/head";
import { Fragment } from "react";

import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";
import styles from "./home.module.scss";

// Client-side
// Server-side
// Static site generation

// Conteudos - (SSG)
// Comentários (Client-Side)

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <Fragment>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            for <span>{product.amount}</span> month
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </Fragment>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const price: any = await stripe.prices.retrieve('price_1M0zbrKH8dNlHOzGt7mG8mBe', {
    expand: ['product']
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount / 100)
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24 // 24 hours
  };
};
