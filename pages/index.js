import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [dishInput, setDishInput] = useState("");
  const [result, setResult] = useState();
  const [imgUrl, setImgUrl] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dish: dishInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setImgUrl(data.imgUrl);
      setDishInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }
  console.log(result) 
  return (
    <div>
      <Head>
        <title>What should I eat? - An OpenAI Quickstart Demo</title>
        <link rel="icon" href="/food.png" />
      </Head>

      <main className={styles.main}>
        <img src="/food.png" className={styles.icon} />
        <h3>What can I cook with these?</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="dish"
            placeholder="Enter any ingredients you have in your ref."
            value={dishInput}
            onChange={(e) => setDishInput(e.target.value)}
          />
          <input type="submit" value="Generate recipes!" />
        </form>
        <div className={result == undefined ? styles.hidden : styles.result}>
            <div className={styles.flex}>
              <img src={imgUrl} alt="Generated Dish Image" />
            </div>
            <div className={styles.flex}>
              <p>{result}</p>
            </div>
        </div>
      </main>
    </div>
  );
}
