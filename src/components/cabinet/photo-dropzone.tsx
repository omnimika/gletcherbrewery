"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import styles from "./photo-dropzone.module.css";

type Props = {
  name?: string;
  accept?: string;
  maxBytes?: number;
  onFileChange?: (file: File | null) => void;
};

export function PhotoDropzone({
  name = "photo",
  accept = "image/*",
  maxBytes = 8_000_000,
  onFileChange,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyFile(next: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!next) {
      setFile(null);
      setPreviewUrl(null);
      setError(null);
      onFileChange?.(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (!next.type.startsWith("image/")) {
      setError("Нужен файл изображения");
      return;
    }
    if (next.size > maxBytes) {
      setError(`Файл больше ${Math.round(maxBytes / 1_000_000)} МБ`);
      return;
    }
    setError(null);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    onFileChange?.(next);
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(next);
      inputRef.current.files = dt.files;
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    applyFile(e.target.files?.[0] ?? null);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    applyFile(dropped);
  }

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        capture="environment"
        className={styles.input}
        onChange={onInputChange}
      />
      <label
        htmlFor={inputId}
        className={`${styles.zone} ${dragging ? styles.dragging : ""} ${file ? styles.hasFile : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img src={previewUrl} alt="" className={styles.preview} />
        ) : (
          <span className={styles.hint}>
            <span className={styles.hintTitle}>Фото чека с QR</span>
            <span className={styles.hintBody}>
              Нажмите или перетащите сюда · до {Math.round(maxBytes / 1_000_000)}{" "}
              МБ
            </span>
          </span>
        )}
      </label>
      {file ? (
        <div className={styles.meta}>
          <span className={styles.fileName}>{file.name}</span>
          <button
            type="button"
            className={styles.clear}
            onClick={() => applyFile(null)}
          >
            Убрать
          </button>
        </div>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
