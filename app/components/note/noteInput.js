"use client";
import makeUniqueId from "@/app/code/uniqueId";
import { useEffect, useState } from "react";
import SourceInput from "../source/sourceInput";
import Link from "next/link";
import styles from "./noteInput.module.css";

export default function NoteInput({ availableSources }) {
  let [text, setText] = useState("");
  let [sources, setSources] = useState([]);

  let [uniqueId, setUniqueId] = useState();
  useEffect(() => {
    setUniqueId(makeUniqueId());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if(text.length === 0){
      console.error("Need text")
    }
    if(sources.length === 0){
      console.error("Need at least one source")
    }
    if(text.length === 0 || sources.length === 0){
      return;
    }
    const note = { text, sources };
    let response = await fetch("./api/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note)
    })

    console.log(await response.json());
  }

  return (
    <div className={styles.form}>
      <label htmlFor={"text_" + uniqueId} className={styles.required}>
        Text
        <textarea
          id={"text_" + uniqueId}
          defaultValue={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          required
        ></textarea>
      </label>

      {sources.length > 0 ? (
        <div>
          <h4 className={styles.required}>Current Sources</h4>
          <ul>
            {sources.map((src) => {
              return (
                <li key={src._id}>
                  <Link href={src.url}>{src.title}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div>
          <h4 className={styles.required}>No Sources Added</h4>
        </div>
      )}

      <fieldset>
        <legend>Add Another Source</legend>
        <label htmlFor={"sourceOptions_" + uniqueId}>
          Select from a list of sources
        </label>
        <input
          id={"sourceOptions_" + uniqueId}
          list={"sourceList_" + uniqueId}
          onChange={(e) => {
            let newSource = availableSources.find(
              (x) => x._id === e.target.value
            );
            if (newSource && sources.indexOf(newSource) === -1) {
              setSources([...sources, newSource]);
            }
            e.target.value = "";
          }}
        ></input>

        {/* MDN raises accessibility concerns about <datalist>. May consider different option. */}
        <datalist id={"sourceList_" + uniqueId}>
          {availableSources.map((src) => {
            if (sources.indexOf(src) !== -1) return;
            return (
              <option key={src._id} value={src._id} label={src.title}></option>
            );
          })}
        </datalist>

        <div>
          Add New Source
          <SourceInput></SourceInput>
        </div>
      </fieldset>
      
      <button onClick={handleSubmit}>Submit Note</button>
    </div>
  );
}
