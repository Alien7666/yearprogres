import Error from 'next/error'
import { NextPageContext } from 'next'

interface ErrorProps {
  statusCode: number
}

export default function ErrorPage({ statusCode }: ErrorProps) {
  return <Error statusCode={statusCode} />
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? (err as any).statusCode : 404
  return { statusCode }
}
