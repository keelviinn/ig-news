import Link from 'next/link';
import Head from 'next/head';
import { RichText } from 'prismic-dom';

import { createClient } from '../../services/prismicio';
import styles from './styles.module.scss';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export async function getStaticProps({ previewData }: any) {
  const client = createClient({ previewData })

  const response = await client.getAllByType('publication', {
    fetchLinks: ['publication.title', 'publication.content'],
    pageSize: 100
  })

  const posts = response.map(({ uid, data, last_publication_date,  ...props }) => ({
    slug: uid,
    title: RichText.asText(data.title),
    excerpt: data.content.find((content: any) => content.type === 'paragraph')?.text ?? '',
    updatedAt: new Date(last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }))
    
  return {
    props: { posts },
  }
}