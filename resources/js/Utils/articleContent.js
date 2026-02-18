
export function alignClass(align) {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    if (align === "justify") return "text-justify";
    return "text-left";
}

export function imageAlignStyle(align) {
    if (align === "center") return { display: "block", margin: "0 auto" };
    if (align === "right") return { display: "block", marginLeft: "auto" };
    return {};
}

export function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage/')) return path;
    return `/storage/${path}`;
}
