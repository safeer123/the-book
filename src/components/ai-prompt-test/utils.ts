export function formatTextToHTML(inputText: string) {
	// Replace double asterisks with <strong> tags for bold text
	let formattedText = inputText.replace(
		/\*\*(.*?)\*\*/g,
		'<strong>$1</strong>'
	);

	// Replace new lines with <br> tags
	formattedText = formattedText.replace(/\n/g, '<br>');

	// Optionally, you can add more formatting rules here if needed

	return formattedText;
}
