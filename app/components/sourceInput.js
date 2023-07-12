"use client";
import { useState, useRef } from "react";

export default function SourceInput() {
  let [title, setTitle] = useState("");
  let [medium, setMedium] = useState("");
  let [url, setUrl] = useState("");
  let [contributors, setContributors] = useState(["blah", "blah"]);
  let [lastAccessed, setLastAccessed] = useState(new Date());
  let [publishDate, setPublishDate] = useState("");

  const uniqueId = new Date().getTime();
  const addContributorRef = useRef();

  function handleAddContributor(e) {
    e.preventDefault();
    console.log(addContributorRef.current.value);
    setContributors([...contributors, addContributorRef.current.value]);
  }

  return (
    <form>
      <label htmlFor={"title" + uniqueId}>
        Title
        <input
          id={"title" + uniqueId}
          type="text"
          onChange={(e) => setTitle(e.target.value)}
        ></input>
      </label>

      <label htmlFor={"medium" + uniqueId}>
        <input id={"medium" + uniqueId} type="text"></input>
      </label>

      <label htmlFor={"url" + uniqueId}>
        <input id={"url" + uniqueId} type="text"></input>
      </label>

      <label htmlFor={"lastAccessed" + uniqueId}>
        <input id={"lastAccessed" + uniqueId} type="date"></input>
      </label>

      <label htmlFor={"publishDate" + uniqueId}>
        <input id={"publishDate" + uniqueId} type="date"></input>
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
      <button
        onClick={(e) => {
          e.preventDefault();
          console.log(title, contributors);
        }}
      >
        Submit
      </button>
    </form>
  );
}
