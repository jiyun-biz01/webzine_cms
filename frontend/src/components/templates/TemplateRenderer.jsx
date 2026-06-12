import styles from "./templates.module.css";

const LAYOUTS = {
  "basic":       "layout_basic",
  "image-top":   "layout_image_top",
  "image-left":  "layout_image_left",
  "image-right": "layout_image_right",
  "image-2col":  "layout_image_2col",
  "magazine":    "layout_magazine",
};

function TemplateRenderer({ article, template }) {
  if (!article) return null;

  const layoutType  = template?.layoutType ?? "basic";
  const layoutClass = LAYOUTS[layoutType] ?? LAYOUTS["basic"];

  const getImage = (slot) => {
    const found = article.images?.find((img) => img.slot === slot);
    return found?.url || null;
  };

  return (
    <article className={`${styles.article} ${styles[layoutClass]}`}>

      {article.category && (
        <span className={styles.category}>{article.category}</span>
      )}

      <h1 className={styles.title}>{article.title}</h1>

      {(template?.imageSlots ?? 0) > 0 && (
        <>
          {Array.from({ length: template.imageSlots }, (_, i) => i + 1).map((slot) => {
            const url = getImage(slot);
            return (
              <div key={slot} className={`${styles.imageSlot} ${styles[`slot_${slot}`]}`}>
                {url ? (
                  <img src={url} alt={template.slotLabels?.[slot - 1] ?? `이미지 ${slot}`} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>{template.slotLabels?.[slot - 1] ?? `이미지 ${slot}`}</span>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
      />

    </article>
  );
}

export default TemplateRenderer;
