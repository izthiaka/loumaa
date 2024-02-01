import * as crypto from 'crypto';

const CODELENGTH = 10;

export default class MatriculeGenerate {
  generate(prefix = '', length: number = CODELENGTH) {
    const alpha = this.#alpha();
    const numeric = this.#numeric();

    const characters = alpha.concat(numeric);

    const code = this.#generadeCodeFromArray(characters, length);

    if (prefix != null) {
      return `${prefix}${code}`;
    }

    return code;
  }

  #alpha() {
    return Array.from(Array(26), (_, index) => String.fromCharCode(65 + index));
  }
  #numeric() {
    return Array.from(Array(10), (_, index) => index.toString());
  }

  #generadeCodeFromArray(characters: string[], length: number) {
    return Array.from(Array(length), () => {
      const randomIndex = crypto.randomBytes(1)[0] % characters.length;
      return characters[randomIndex];
    }).join('');
  }

  getCodeUnique(code: string, chaine: string) {
    const mots = chaine.split(' ');

    if (mots.length === 1) {
      const consonnes = chaine.replace(/[^bcdfghjklmnpqrstvwxyz]/gi, '');
      return `${code}-${consonnes.toUpperCase()}`;
    } else {
      const initiales = mots.map((mot) => mot[0]).join('');
      return `${code}-${initiales.toUpperCase()}`;
    }
  }

  generateScoutMatricule(
    sexe: string,
    dateNaissance: Date,
    numero: number,
  ): string {
    const codeSexe =
      sexe.toLowerCase() === 'masculin'
        ? '1'
        : sexe.toLowerCase() === 'féminin'
          ? '2'
          : '';

    const annee = new Date(dateNaissance).getFullYear();
    const mois = (new Date(dateNaissance).getMonth() + 1)
      .toString()
      .padStart(2, '0');
    const jour = new Date(dateNaissance).getDate().toString().padStart(2, '0');
    const dateNaissanceFormattee = `${annee}${mois}${jour}`;

    const nombreAleatoire = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    const numeroStr = numero.toString().padStart(2, '0');

    // Créez la chaîne de caractères finale
    return `${codeSexe} ${dateNaissanceFormattee} ${nombreAleatoire} ${numeroStr}`;
  }
}
