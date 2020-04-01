export async function readRecordFile(): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    let fileInput = document.createElement("input");

    fileInput.setAttribute("type", "file");
    fileInput.click();

    fileInput.onerror = reject;

    fileInput.onchange = (): void => {
      let fileReader = new FileReader();

      let file = fileInput.files?.item(0);

      if (!file) {
        reject();
        return;
      }

      fileReader.readAsArrayBuffer(file);

      fileReader.onerror = reject;
      fileReader.onload = ({ target }: ProgressEvent<FileReader>): void => {
        if (!target) {
          return;
        }

        let { readyState, result } = target;

        if (readyState === FileReader.DONE) {
          try {
            let bytes = new Uint8Array(result as ArrayBuffer);

            resolve(bytes);
          } catch (error) {
            reject(error);
          }
        }
      };
    };
  });
}
