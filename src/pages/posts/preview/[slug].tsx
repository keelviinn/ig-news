import { useEffect } from 'react';
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from 'prismic-dom';

import { createClient } from "../../../services/prismicio";
import styles from '../post.module.scss';

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data: session }: any = useSession()
  const route = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      route.push(`/posts/${post.slug}`);
    }
  }, [post, route, session])

  return (
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className={`${styles.postContent} ${styles.previewContent}`}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              Subscribe now 🤗
            </Link>
          </div>
        </article>
      </main>
        
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking', // can also be true, false or 'blocking'
  }
}
// Pagina estatica nao é protegida por autenticação
export async function getStaticProps({ previewData, params }: any) {
  const { slug } = params;
  
  const prismic = createClient({ previewData });

  const response = await prismic.getByUID('publication', String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    }, // will be passed to the page component as props
    revalidate: 60 * 30, // 30 minutes
  }
}