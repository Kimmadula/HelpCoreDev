import ReactMarkdown from "react-markdown";
import { alignClass, imageAlignStyle, getYouTubeId, getImageUrl } from "@/Utils/articleContent";
import '../../../css/editor.css';

export default function ArticleRenderer({ blocks }) {
    if (!blocks?.length) {
        return (
            <div className="text-gray-500 italic py-8 text-center">
                No content available yet.
            </div>
        );
    }

    return (
        <div className="article-content">
            {blocks.map((b) => {
                // HEADING
                if (b.type === "heading") {
                    const cls = alignClass(b.align);
                    const style = { textAlign: b.align };

                    if (b.heading_level === 3) {
                        return (
                            <h3 key={b.id} className={`article-h3 ${cls}`} style={style}>
                                {b.text}
                            </h3>
                        );
                    }
                    return (
                        <h2 key={b.id} className={`article-h2 ${cls}`} style={style}>
                            {b.text}
                        </h2>
                    );
                }

                // PARAGRAPH
                if (b.type === "paragraph") {
                    const cls = alignClass(b.align);
                    const ytId = getYouTubeId(b.text?.trim() ?? "");

                    if (ytId) {
                        const style = imageAlignStyle(b.align);
                        return (
                            <div key={b.id} className="article-image-wrapper" style={{ ...style, maxWidth: '900px', margin: '0 auto' }}>
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${ytId}`}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        );
                    }

                    const style = { textAlign: b.align };

                    return (
                        <div key={b.id} className={`article-p ${cls}`} style={style}>
                            <ReactMarkdown>{b.text ?? ""}</ReactMarkdown>
                        </div>
                    );
                }

                // LIST
                if (b.type === "list") {
                    const items = Array.isArray(b.list_items) ? b.list_items : [];
                    const cls = alignClass(b.align);

                    if (b.list_style === "number") {
                        return (
                            <ol key={b.id} className={`${cls} list-decimal pl-6 mb-4`}>
                                {items.map((it, i) => (
                                    <li key={i}>{it}</li>
                                ))}
                            </ol>
                        );
                    }

                    return (
                        <ul key={b.id} className={`${cls} list-disc pl-6 mb-4`}>
                            {items.map((it, i) => (
                                <li key={i}>{it}</li>
                            ))}
                        </ul>
                    );
                }

                // IMAGE
                if (b.type === "image") {
                    const style = imageAlignStyle(b.align);
                    let maxWidth = "100%";
                    if (b.image_width === "sm") maxWidth = "320px";
                    if (b.image_width === "md") maxWidth = "520px";
                    if (b.image_width === "lg") maxWidth = "760px";
                    if (b.image_width === "full") maxWidth = "100%";

                    return (
                        <div key={b.id} className="article-image-wrapper">
                            <img
                                src={getImageUrl(b.image_path)}
                                alt=""
                                style={{ ...style, maxWidth, borderRadius: 8 }}
                            />
                        </div>
                    );
                }

                // RICH TEXT
                if (b.type === "richtext") {
                    const cls = alignClass(b.align);
                    let content = b.text ?? "";

                    // Auto-embed YouTube links
                    content = content.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>.*?<\/a>/gi, (match, quote, url) => {
                        const ytId = getYouTubeId(url);
                        if (ytId) {
                            return `
                                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin-bottom: 1em;">
                                    <iframe 
                                        src="https://www.youtube.com/embed/${ytId}" 
                                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowfullscreen
                                    ></iframe>
                                </div>
                            `;
                        }
                        return match;
                    });

                    return (
                        <div
                            key={b.id}
                            className={`article-richtext ${cls}`}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
}
