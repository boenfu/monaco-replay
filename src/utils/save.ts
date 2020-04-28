import FileSaver from "file-saver";
import { ExcerptMessage, IExcerptMessage } from "../protobuf";

function buildExcerptMessage(excerpt: IExcerptMessage): Blob {
  let bytes = ExcerptMessage.encode(excerpt).finish();

  return new Blob([bytes], {
    type: "text/plain;charset=utf-8",
  });
}

export function getExcerptMessageFormData(
  excerpt: IExcerptMessage,
  filedName: string = "file",
  fileName: string = String(Date.now())
): FormData {
  let blob = buildExcerptMessage(excerpt);

  let form = new FormData();

  form.append(filedName, blob, fileName);

  return form;
}

export function saveExcerptMessageToFile(
  excerpt: IExcerptMessage,
  fileName: string = String(Date.now())
): void {
  let blob = buildExcerptMessage(excerpt);

  FileSaver.saveAs(blob, `${fileName}.mrp`, { autoBom: true });
}
