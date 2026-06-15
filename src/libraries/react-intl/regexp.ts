const formattedMessageRegExp: string = `(?<=<(?:FormattedMessage|FormattedHTMLMessage)[^>]*\\bid=(?:\\{?['"]))([^'"]+)(?=['"]\\}?)`;
const formatMessageRegExp: string = `(?<=(?<![A-Za-z0-9])formatMessage\\s*\\(\\s*\\{\\s*id\\s*:\\s*['"])([^'"]+)(?=['"])`;

export const reactIntlRegEx: string[] = [
    formattedMessageRegExp,
    formatMessageRegExp
];