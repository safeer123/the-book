const escapeRegExp = (str: string) => {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

const fullWordSearchRegex = (searchKey: string) => `^.*?\\b${searchKey.split(",").join('\\b.*?\\b')}\\b.*?$`;
const wordSearchRegex = (searchKey: string) => `^.*?${searchKey.split(",").join('.*?')}.*?$`;

interface Args {
    target: string;
    searchKey: string;
    config: { ignoreCase: boolean, fullWord: boolean }
}

export const matchKeyword = ({target, searchKey, config: {ignoreCase, fullWord}}: Args): boolean => {
    const regex = fullWord ? fullWordSearchRegex(searchKey) : wordSearchRegex(searchKey);
    const flags = ignoreCase ? "mi" : "m";
    const testRes = new RegExp(regex, flags).test(target);
    
    return Boolean(searchKey.trim()) && testRes;
}