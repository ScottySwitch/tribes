import Image from "next/image";
import { useRouter } from "next/router";
import styles from "./CollectionCard.module.scss";

interface CollectionCardProps {
  imgUrl?: string;
  title?: string;
  slug?: string;
}

const CollectionCard = (props: CollectionCardProps) => {
  const { imgUrl, title, slug } = props;
  const router = useRouter();
  return (
    <div
      className={styles.collection_card}
      onClick={() => router.push(`/collection/${slug}`)}
    >
      <div className={styles.title}>{title}</div>
      {/* <div className={styles.banner}> */}
      {imgUrl ? (
        <Image
          alt="thumbnail"
          layout="fill"
          src={imgUrl}
          objectFit="contain"
          sizes="(max-width: 48em) 30vw,
              25vw"
        />
      ) : (
        <div className={styles.skeleton} />
      )}
      {/* </div> */}
    </div>
  );
};

export default CollectionCard;
