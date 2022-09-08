import Image from "next/image";
import { useEffect, useState } from "react";
import { get, isEmpty } from "lodash";

import Icon from "components/Icon/Icon";
import InforCard from "components/InforCard/InforCard";
import Pagination from "components/Pagination/Pagination";
import SectionLayout from "components/SectionLayout/SectionLayout";
import TopSearches from "components/TopSearches/TopSearches";
import Loader from "components/Loader/Loader";
import Button from "components/Button/Button";
import Filter from "components/Filter/Filter";
import CollectionApi from "services/collection";

import styles from "styles/Home.module.scss";
import { useRouter } from "next/router";
import TabsHorizontal, { ITab } from "components/TabsHorizontal/TabsHorizontal";
import { Categories, CategoryText } from "enums";
import { categories } from "constant";
import {
  changeToSlugify,
  formatBizlistingArray,
  formatCardItemProps,
  getListingUrl,
  isArray,
} from "utils";

type Object = {
  [key: string]: any;
};

const allTab = [{ label: "All", value: undefined }];
const categoryTabList: any[] = categories.map((item) => ({
  label: item.slug,
  value: item.slug,
}));
const tabList: any[] = allTab.concat(categoryTabList);

const Collection = (props: any) => {
  const {listing, collectionDetail} = props;
  const router = useRouter();
  return (
    <div>
      <SectionLayout className="py-0 pb-3">
        <div className={styles.breadcrumbs}>
          <span onClick={() => router.push("/")}>Home</span>{" "}
          <Icon icon="carret-right" size={14} color="#7F859F" />
          Collection
        </div>
      </SectionLayout>
      <SectionLayout className={styles.collection_banner}>
        {collectionDetail.banner && (
          <Image
            src={collectionDetail.banner}
            alt="banner"
            layout="fill"
            objectFit="cover"
            className={`${styles.collection_banner_img} ${styles.collection_banner_desktop}`}
          />
        )}
        {collectionDetail.bannerMobile && (
          <Image
            src={collectionDetail.bannerMobile}
            alt="banner"
            layout="fill"
            objectFit="cover"
            className={styles.collection_banner_mobile}
          />
        )}
        <div className={styles.collection_context_container}>
          <h1 className={styles.collection_name}>
            {collectionDetail.collectionName}
          </h1>
          <h2 className={styles.collection_description}>
            {collectionDetail.description}
          </h2>
        </div>
      </SectionLayout>
      <SectionLayout>
        <div className="flex flex-wrap gap-3 md:gap-2 lg:gap-5">
          {Array.isArray(listing) &&
            listing.map((item) => (
              <div key={item?.title} className="pb-5 pt-3 pl-3">
                <InforCard
                  {...formatCardItemProps(item)}
                  onClick={() => {
                    router.push(
                      `/${getListingUrl(
                        get(item, "categories[0]"),
                        get(item, "categoryLinks[0].attributes.value"),
                        item.slug
                      )}`
                    );
                  }}
                />
              </div>
            ))}
        </div>
        <TopSearches />
      </SectionLayout>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { collectionSlug } = context.query;
  
  const response = await CollectionApi.getAllCollectionByCollectionSlug(
    collectionSlug
  );
  console.log(response);
  const listingsOfCollection = get(
    response,
    "data.data[0].attributes.biz_listings.data"
  );

  const banner = get(
    response,
    "data.data[0].attributes.banner.data.attributes.url"
  );
  const bannerMobile =
    get(
      response,
      "data.data[0].attributes.banner_mobile.data.attributes.url"
    ) || banner;
  const collectionName = get(response, "data.data[0].attributes.name");
  const description = get(response, "data.data[0].attributes.description");

  const collectionDetailObject = {
    collectionName,
    description,
    banner,
    bannerMobile,
  };

  const mappedListings = isArray(listingsOfCollection)
        ? formatBizlistingArray(listingsOfCollection)
        : [];

  return { 
    props: { 
      listing: mappedListings,
      collectionSlug: collectionSlug,
      collectionDetail: collectionName && description && banner ? collectionDetailObject : {},
      total: get(response, "data.data[0].attributes.biz_listings.data.length")
    } 
  };
}

export default Collection;
