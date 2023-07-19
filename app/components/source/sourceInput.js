"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./sourceInput.module.css";

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

  let uniqueId;
  useEffect(() => {
    uniqueId = new Date().getTime();
    setLastAccessed(new Date().toISOString().split("T")[0]);
  }, []);
  const addContributorRef = useRef();

  useEffect(() => {
    setValidUrl(
      /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(e.target.value)
    );

    setValidAccessed(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value));

    setValidPublish(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value));
  }, [url, lastAccessed, publishDate]);

  function handleAddContributor(e) {
    e.preventDefault();
    setContributors([...contributors, addContributorRef.current.value]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    function formatDate(htmlDate) {
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
      <label htmlFor={"title" + uniqueId}>
        Title
        <input
          id={"title" + uniqueId}
          type="text"
          defaultValue={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        ></input>
      </label>

      <label htmlFor={"medium" + uniqueId}>
        Medium
        <input
          id={"medium" + uniqueId}
          type="text"
          defaultValue={medium}
          onChange={(e) => setMedium(e.target.value)}
          required
        ></input>
      </label>

      <label htmlFor={"url" + uniqueId}>
        URL of Source
        <input
          id={"url" + uniqueId}
          type="text"
          defaultValue={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
          required
        ></input>
        {validUrl ? null : (
          <span style={{ color: "red" }}>Please use valid URL format</span>
        )}
      </label>

      <label htmlFor={"lastAccessed" + uniqueId}>
        Last Accessed
        <input
          id={"lastAccessed" + uniqueId}
          type="date"
          defaultValue={lastAccessed}
          onChange={(e) => {
            setLastAccessed(e.target.value);
          }}
        ></input>
        {validAccessed ? null : (
          <span style={{ color: "red" }}>Please use YYYY-MM-DD format</span>
        )}
      </label>

      <label htmlFor={"publishDate" + uniqueId}>
        Published
        <input
          id={"publishDate" + uniqueId}
          type="date"
          defaultValue={publishDate}
          onChange={(e) => {
            setPublishDate(e.target.value);
          }}
        ></input>
        {validPublish ? null : (
          <span style={{ color: "red" }}>Please use YYYY-MM-DD format</span>
        )}
      </label>

      <p>Contributors</p>
      <ul>
        {contributors.map((cont, index) => {
          return <li key={index}>{cont}</li>;
        })}
        <li>
          <label htmlFor={"title" + uniqueId}>
            New Contributor
            <input
              id={"title" + uniqueId}
              type="text"
              ref={addContributorRef}
            ></input>
          </label>
          <button onClick={handleAddContributor}>Add Contributor</button>
        </li>
      </ul>
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
}
