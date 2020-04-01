import FileSaver from "file-saver";

export function saveRecordBytes(
  bytes: Uint8Array,
  fileName: string = String(Date.now())
): void {
  let blob = new Blob([bytes], {
    type: "text/plain;charset=utf-8"
  });

  FileSaver.saveAs(blob, fileName, { autoBom: true });
}
