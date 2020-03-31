import FileSaver from "file-saver";

export function downloadRecord(
  bytes: Uint8Array,
  fileName: string = String(Date.now())
): void {
  let blob = new Blob([new TextDecoder().decode(bytes)], {
    type: "application/octet-stream"
  });

  FileSaver.saveAs(blob, fileName);
}
