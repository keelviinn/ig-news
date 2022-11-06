import { useSession, signIn, signOut } from "next-auth/react";

import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe.js";
import styles from './styles.module.scss';

//how to use secret credentials
//getServerSideProps (SSR)
//getStaticProps (SSG)
//API routes

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session, status } = useSession();

  async function handleSubscribe() {
    if (status === 'unauthenticated') {
      signIn('github');
      return;
    }

    try {
      const response = await api.post('/subscribe');
      const { sessionId } = response.data;

      const stripe = await getStripeJs();

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  );
}