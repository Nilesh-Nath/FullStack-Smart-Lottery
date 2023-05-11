import Head from "next/head";
import ManualHeader from "../../components/ManualHeader";
import Header from "../../components/Header";
import EnterRaffle from "../../components/EnterRaffle";

export default function Home() {
  return (
    <>
      <Head>
        <title>Smart Lottery</title>
        <meta name="description" content="Simple Blockchain based Lottery!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <ManualHeader /> */}
      <Header />
      <EnterRaffle />
    </>
  );
}
