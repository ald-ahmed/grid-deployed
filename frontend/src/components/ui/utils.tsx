import { iconSetQuartzLight, themeQuartz, Theme } from "ag-grid-community";

export const gridTheme: Theme = themeQuartz
  .withPart(iconSetQuartzLight)
  .withParams({
    accentColor: "#2238F2",
    backgroundColor: "#FFFFFF",
    borderColor: "#2E37421C",
    borderRadius: 10,
    browserColorScheme: "inherit",
    columnBorder: false,
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen-Sans",
      "Ubuntu",
      "Cantarell",
      "Helvetica Neue",
      "sans-serif",
    ],
    fontSize: 12,
    foregroundColor: "rgb(46, 55, 66)",
    headerBackgroundColor: "#F7F9FA00",
    headerFontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen-Sans",
      "Ubuntu",
      "Cantarell",
      "Helvetica Neue",
      "sans-serif",
    ],
    headerFontSize: 12,
    headerFontWeight: 700,
    headerRowBorder: true,
    headerTextColor: "rgb(46, 55, 66)",
    headerVerticalPaddingScale: 1,
    oddRowBackgroundColor: "#F9FAFB",
    rowBorder: true,
    rowVerticalPaddingScale: 0.4,
    sidePanelBorder: true,
    spacing: 5,
    wrapperBorder: false,
    wrapperBorderRadius: 5,
  });

// JSON syntax highlighter function
export const formatJSON = (obj: any): React.ReactNode => {
  const jsonString = JSON.stringify(obj, null, 2);

  // Split into lines and process each line
  const lines = jsonString.split("\n");

  return (
    <>
      {lines.map((line, index) => {
        const processedLine = line
          // Color property keys (in quotes) - bright blue-ish
          .replace(/"([^"]+)":/g, '<span style="color: #60a5fa;">"$1"</span>:')
          // Color string values (in quotes, not followed by colon) - bright green
          .replace(
            /:\s*"([^"]*)"(?!:)/g,
            ': <span style="color: #34d399;">"$1"</span>'
          )
          // Color numbers - bright yellow
          .replace(
            /:\s*(\d+\.?\d*)/g,
            ': <span style="color: #fbbf24;">$1</span>'
          )
          // Color booleans - bright orange
          .replace(
            /:\s*(true|false)/g,
            ': <span style="color: #fb923c;">$1</span>'
          )
          // Color null - using available gray
          .replace(/:\s*(null)/g, ': <span class="text-gray-9">$1</span>')
          // Color brackets and braces - bright purple
          .replace(/([{}\[\]])/g, '<span style="color: #a78bfa;">$1</span>');

        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      })}
    </>
  );
};
