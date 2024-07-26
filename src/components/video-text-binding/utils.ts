export const formatDuration = (seconds: number): string => {
	const d = Math.floor(seconds / (24 * 3600));
	seconds %= 24 * 3600;
	const h = Math.floor(seconds / 3600);
	seconds %= 3600;
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);

	const parts = [];
	if (d > 0) parts.push(d);
	if (h > 0 || d > 0) parts.push(h);
	parts.push(m); // Always include minutes
	parts.push(s); // Always include seconds

	return parts.join(':');
};
