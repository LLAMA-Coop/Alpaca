"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import styles from "./sourceInput.module.css";
import { Input, Label } from "../Input/Input";
import { useState, useEffect } from "react";

export default function SourceInput() {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");

  const [medium, setMedium] = useState("");
  const [mediumError, setMediumError] = useState("");

  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const [lastAccessed, setLastAccessed] = useState();
  const [lastAccessedError, setLastAccessedError] = useState("");

  const [publishDate, setPublishDate] = useState();
  const [publishDateError, setPublishDateError] = useState("");

  const [contributors, setContributors] = useState([]);
  const [newContributor, setNewContributor] = useState("");

  const urlRegex = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
  const accessedRegex = /^\d{4}-\d{2}-\d{2}$/;
  const publishRegex = /^\d{4}-\d{2}-\d{2}$/;

  useEffect(() => {
    setLastAccessed(new Date().toISOString().split("T")[0]);
  }, []);

  function handleAddContributor(e) {
    e.preventDefault();
    if (!newContributor) return;
    setContributors([...contributors, newContributor]);
    setNewContributor("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title) {
      setTitleError("Title is required");
    }

    if (!medium) {
      setMediumError("Medium is required");
    }

    if (!urlRegex.test(url)) {
      setUrlError("Invalid URL");
    }

    if (!accessedRegex.test(lastAccessed)) {
      setLastAccessedError("Invalid Date");
    }

    if (!publishRegex.test(publishDate)) {
      setPublishDateError("Invalid Date");
    }

    if (!title || !medium || !url || !validUrl || !validAccessed || !validPublish) {
      return;
    }

    function formatDate(htmlDate) {
      if (!htmlDate) return undefined;
      const ymd = htmlDate.split("-");
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

    const response = await fetch("./api/source", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(src),
    });

    setTitle("");
    setMedium("");
    setUrl("");
    setLastAccessed("");
    setPublishDate("");
    setNewContributor("");
    setContributors([]);
    setTitleError("");
    setMediumError("");
    setUrlError("");
    setLastAccessedError("");
    setPublishDateError("");

    console.log(await response.json());
  }

  return (
    <div className='centeredContainer'>
      <h3>Add Source</h3>
      <form className={styles.form}>
        <Input
          required={true}
          label={"Title"}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError("");
          }}
          value={title}
          error={titleError}
        />

        <Input
          required={true}
          label={"Medium"}
          onChange={(e) => {
            setMedium(e.target.value);
            setMediumError("");
          }}
          value={medium}
          error={mediumError}
        />

        <Input
          required={true}
          label={"URL of Source"}
          onChange={(e) => {
            setUrl(e.target.value);
            setUrlError("");
          }}
          value={url}
          error={urlError}
        />

        <Input
          label={"Last Accessed"}
          onChange={(e) => {
            setLastAccessed(e.target.value);
            setLastAccessedError("");
          }}
          value={lastAccessed}
          type="date"
          error={lastAccessedError}
        />

        <Input
          label={"Published"}
          onChange={(e) => {
            setPublishDate(e.target.value);
            setPublishDateError("");
          }}
          value={publishDate}
          type="date"
          error={publishDateError}
        />

        <Label label='Contributors' />

        <ul className={styles.chipGrid}>
          {contributors.map((cont, index) => (
            <li key={index}>
              {cont}

              <div
                onClick={() => {
                  setContributors(
                    contributors.filter((_, i) => i !== index)
                  );
                }}
              >
                <FontAwesomeIcon icon={faClose} />
              </div>
            </li>
          ))}
        </ul>

        <Input
          label={"Add Contributor"}
          onChange={(e) => setNewContributor(e.target.value)}
          value={newContributor}
          onSubmit={handleAddContributor}
        />

        <button onClick={handleSubmit}>Submit Source</button>
      </form>
    </div>
  );
}
