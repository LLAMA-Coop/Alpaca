"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./sourceInput.module.css";
import makeUniqueId from "@/app/code/uniqueId";

export default function SourceInput() {
  let [title, setTitle] = useState("");
  let [medium, setMedium] = useState("");
  let [url, setUrl] = useState("");
  let [contributors, setContributors] = useState([]);
  let [lastAccessed, setLastAccessed] = useState();
  let [publishDate, setPublishDate] = useState();

  let [validUrl, setValidUrl] = useState(true);
  let [validAccessed, setValidAccessed] = useState(true);
  let [validPublish, setValidPublish] = useState(true);

  const addContributorRef = useRef();

  let [uniqueId, setUniqueId] = useState("");
  useEffect(() => {
    setUniqueId(makeUniqueId());
    setLastAccessed(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    setValidUrl(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(url));

    setValidAccessed(/^\d{4}-\d{2}-\d{2}$/.test(lastAccessed));

    setValidPublish(/^\d{4}-\d{2}-\d{2}$/.test(publishDate));
  }, [url, lastAccessed, publishDate]);

  function handleAddContributor(e) {
    e.preventDefault();
    setContributors([...contributors, addContributorRef.current.value]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    function formatDate(htmlDate) {
      if (!htmlDate) return undefined;
      let ymd = htmlDate.split("-");
      return new Date(ymd[0], ymd[1] - 1, ymd[2]);
    }

    const src = {
      title,
      medium,
      url,
      contributors,
      lastAccessed: formatDate(lastAccessed),
      publishDate: formatDate(publishDate),
    };
    let response = await fetch("./api/source", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(src),
    });

    console.log(await response.json());
  }

  return (
    <form className={styles.form}>
      <label htmlFor={"title_" + uniqueId} className={styles.required}>
        Title
        <input
          id={"title_" + uniqueId}
          type="text"
          defaultValue={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        ></input>
      </label>

      <label htmlFor={"medium_" + uniqueId} className={styles.required}>
        Medium
        <input
          id={"medium_" + uniqueId}
          type="text"
          defaultValue={medium}
          onChange={(e) => setMedium(e.target.value)}
          required
        ></input>
      </label>

      <label htmlFor={"url_" + uniqueId} className={styles.required}>
        URL of Source
        <input
          id={"url_" + uniqueId}
          type="text"
          defaultValue={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
          required
        ></input>
        {validUrl ? null : (
          <span className={styles.warn}>Please use valid URL format</span>
        )}
      </label>

      <label htmlFor={"lastAccessed_" + uniqueId}>
        Last Accessed
        <input
          id={"lastAccessed_" + uniqueId}
          type="date"
          defaultValue={lastAccessed}
          onChange={(e) => {
            setLastAccessed(e.target.value);
          }}
        ></input>
        {validAccessed ? null : (
          <span className={styles.warn}>Please use YYYY-MM-DD format</span>
        )}
      </label>

      <label htmlFor={"publishDate_" + uniqueId}>
        Published
        <input
          id={"publishDate_" + uniqueId}
          type="date"
          defaultValue={publishDate}
          onChange={(e) => {
            setPublishDate(e.target.value);
          }}
        ></input>
        {validPublish ? null : (
          <span className={styles.warn}>Please use YYYY-MM-DD format</span>
        )}
      </label>

      <p className={styles.required}>Contributors</p>
      <ul>
        {contributors.map((cont, index) => {
          return <li key={index}>{cont}</li>;
        })}
        <li>
          <label htmlFor={"contributor_" + uniqueId}>
            New Contributor
            <input
              id={"contributor_" + uniqueId}
              type="text"
              ref={addContributorRef}
            ></input>
          </label>
          <button onClick={handleAddContributor}>Add Contributor</button>
        </li>
      </ul>
      <button onClick={handleSubmit}>Submit Source</button>
    </form>
  );
}
