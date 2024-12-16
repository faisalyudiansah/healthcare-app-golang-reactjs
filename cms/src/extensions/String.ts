function capitalize(this: string): string {
  return this.split("")
    .map((char) => char.toUpperCase())
    .join("");
}

function toTitle(this: string) {
  return this.toLowerCase()
    .toLowerCase()
    .split(" ")
    .map((word: string) => {
      if (["of", "or"].includes(word)) return word;

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

declare global {
  interface String {
    capitalize(): string;
    toTitle(): string;
  }
}

export default function stringExtension() {
  String.prototype.capitalize = capitalize;
  String.prototype.toTitle = toTitle;
}
