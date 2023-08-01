"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import styles from "./sourceInput.module.css";
import { Input, Label, ListItem } from "../form/Form";
import { useState, useEffect } from "react";
import makeUniqueId from "@/app/code/uniqueId";

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

  const [loading, setLoading] = useState(false);
  const [uniqueId, setUniqueId] = useState();

  const urlRegex = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
  const accessedRegex = /^\d{4}-\d{2}-\d{2}$/;
  const publishRegex = /^\d{4}-\d{2}-\d{2}$/;

  useEffect(() => {
    setLastAccessed(new Date().toISOString().split("T")[0]);
    setUniqueId(makeUniqueId());
  }, []);

  function handleAddContributor(e) {
    e.preventDefault();
    if (!newContributor || contributors.includes(newContributor)) return;
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

    if (!title || !medium || !url || !lastAccessed) {
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

    setLoading(true);

    const response = await fetch("./api/source", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(src),
    });

    setLoading(false);

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
    <div className="centeredContainer">
      <h3>Add Source</h3>
      <form className={styles.form}>
        <div>
          <div>
            <Input
              id={"title_" + uniqueId}
              required={true}
              label={"Title"}
              value={title}
              error={titleError}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
            />

            <Input
              id={"medium_" + uniqueId}
              required={true}
              label={"Medium"}
              value={medium}
              error={mediumError}
              onChange={(e) => {
                setMedium(e.target.value);
                setMediumError("");
              }}
            />

            <Input
              id={"url_" + uniqueId}
              required={true}
              label={"URL of Source"}
              value={url}
              error={urlError}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError("");
              }}
            />

            <Input
              id={"lastAcc_" + uniqueId}
              type="date"
              label={"Last Accessed"}
              value={lastAccessed}
              error={lastAccessedError}
              onChange={(e) => {
                setLastAccessed(e.target.value);
                setLastAccessedError("");
              }}
            />
          </div>

          <div>
            <Input
              id={"pubDate_" + uniqueId}
              type="date"
              label={"Published"}
              value={publishDate}
              error={publishDateError}
              onChange={(e) => {
                setPublishDate(e.target.value);
                setPublishDateError("");
              }}
            />

            <Input
              id={"addCont_" + uniqueId}
              label={"Add Contributor"}
              value={newContributor}
              onChange={(e) => setNewContributor(e.target.value)}
              onSubmit={handleAddContributor}
            />

            <Label label="Contributors" />

            <ul className={styles.chipGrid}>
              {contributors.length === 0 && (
                <ListItem item="No Contributors Added" />
              )}

              {contributors.map((cont) => (
                <ListItem
                  key={cont}
                  item={cont}
                  action={() => {
                    setContributors(
                      contributors.filter((name) => cont !== name)
                    );
                  }}
                  actionType={"delete"}
                />
              ))}
            </ul>
          </div>
        </div>

        <button onClick={handleSubmit} className="submitButton">
          {loading ? "Sending..." : "Submit Source"}
        </button>
      </form>
    </div>
  );
}
