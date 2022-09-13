import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { get, shuffle } from "lodash";

import ArticleCard from "components/ArticleCard/ArticleCard";
import Carousel from "components/Carousel/Carousel";
import CollectionCard from "components/CollectionCard/CollectionCard";
import Icon from "components/Icon/Icon";
import { UserInforContext } from "Context/UserInforContext";
import InforCard from "components/InforCard/InforCard";
import SectionLayout from "components/SectionLayout/SectionLayout";
import TopSearches from "components/TopSearches/TopSearches";
import { CategoryText } from "enums";
import BizListingApi from "services/biz-listing";
import BannerApi from "services/banner";
import CollectionApi from "services/collection";
import CategoryLinkApi from "services/category-link";
import Pagination from "components/Pagination/Pagination";
import ArticleApi from "../../services/article";
import { Ilisting } from "type";
import {
  curatedList,
  homeBannerResponsive,
  homeCuratedResponsive,
  infoCardResponsive,
} from "constant";
import {
  formatBizlistingArray,
  isArray,
  formatBanner,
  formatCollections,
  formatArticle,
  formatCategoryLink,
  formatCardItemProps,
  getListingUrl,
} from "utils";

import styles from "styles/Home.module.scss";
import Head from "next/head";
interface IType {
  [key: string]: any;
}
[];

const Category = (props: any) => {
  const router = useRouter();
  const { locale } = useRouter();
  const {
    query: { category },
  } = router;
  const defaultPagination = { page: 1, total: 0, limit: 28 };

  const { metaTitle, metaDescription, categoryInfor, bannerArray, collectionArray, articleArray, dealArray, categoryLinkArray } = props;

  const [pagination, setPagination] = useState(defaultPagination);
  const [listingArray, setListingArray] = useState<IType[]>([]);
  const { user } = useContext(UserInforContext);
  const { location } = user;

  useEffect(() => {
    const getDataListing = async (categoryId, page) => {
      const dataQuery = await BizListingApi.getListingCustom({
        country: location,
        categories: categoryId,
        page: page,
        limit: 28,
      });
      const listings = shuffle(
        formatBizlistingArray(get(dataQuery, "data.data"))
      );
      setListingArray(listings);
      setPagination({
        ...pagination,
        total: get(dataQuery, "data.meta.pagination.total"),
      });
    };
    location && getDataListing(category, pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, category, location]);

  const handleSelectSubCategory = (slug) =>
    router.push({
      pathname: `${category}/${slug}`,
    });

  return (
    <div>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Head>
      <SectionLayout className={styles.main_catbanner}>
        {categoryInfor.bannerSrc && (
          <Image
            src={categoryInfor.bannerSrc}
            alt="banner_category"
            layout="fill"
            objectFit="contain"
            className={`${styles.collection_banner_img} ${styles.banner_desktop}`}
          />
        )}
        {categoryInfor.bannerMobileSrc && (
          <Image
            alt="banner_category"
            src={categoryInfor.bannerMobileSrc}
            layout="fill"
            objectFit="contain"
            className={`${styles.collection_banner_img} ${styles.banner_mobile}`}
          />
        )}
        <div className={styles.collection_context_container}>
          <div className={styles.collection_name}>
            {categoryInfor.categoryName}
          </div>
          <div className={styles.collection_description}>
            {categoryInfor.categoryDescription}
          </div>
        </div>
      </SectionLayout>
      <SectionLayout show={isArray(bannerArray)}>
        <Carousel responsive={homeBannerResponsive}>
          {bannerArray.map((img, index) => (
            <div
              key={index}
              className={styles.banner_card}
              onClick={() => router.push(`${img.linkActive}`)}
            >
              <Image
                layout="intrinsic"
                src={img.imgUrl}
                objectFit="contain"
                width={500}
                height={200}
                alt="banner"
              />
            </div>
          ))}
        </Carousel>
      </SectionLayout>
      <SectionLayout
        title="Explore by Top Categories"
        childrenClassName="flex gap-y-[20px] gap-x-1 md:gap-x-10 lg:gap-x-[50px] flex-wrap"
      >
        {Array.isArray(categoryLinkArray) &&
          categoryLinkArray.map((item, index) => (
            <div
              key={index}
              className={styles.sub_category}
              onClick={() => handleSelectSubCategory(item.slug)}
            >
              <div className={styles.sub_category_icon}>
                <Image
                  src={item.icon || "https://picsum.photos/200/300"}
                  alt="logo"
                  layout="fill"
                />
              </div>
              <div className={styles.sub_category_label}>{item.label}</div>
            </div>
          ))}
      </SectionLayout>
      {isArray(dealArray) && (
        <SectionLayout title="Brands With Exclusive Deals For You">
          <Carousel responsive={infoCardResponsive}>
            {dealArray?.map((card) => (
              <div key={card.title} className="pb-5 pt-3 pl-3">
                <InforCard
                  {...formatCardItemProps(card)}
                  onClick={() => {
                    router.push(
                      `/${getListingUrl(
                        get(card, "categories[0].attributes.name"),
                        get(card, "categoryLinks[0].attributes.value"),
                        card.slug
                      )}`
                    );
                  }}
                />
              </div>
            ))}
          </Carousel>
        </SectionLayout>
      )}
      {Array.isArray(collectionArray) && collectionArray.length > 0 && (
        <SectionLayout backgroundColor title="Specially Curated For You">
          <Carousel responsive={homeCuratedResponsive}>
            {collectionArray?.map((item, index) => (
              <div key={index} className="pb-5 pt-3 pl-3">
                <CollectionCard
                  slug={item.slug}
                  title={item.title}
                  imgUrl={item.imgUrl}
                />
              </div>
            ))}
          </Carousel>
        </SectionLayout>
      )}
      <SectionLayout childrenClassName={styles.for_you_container}>
        {Array.isArray(listingArray) &&
          listingArray.map((card) => (
            <div key={card.title} className="pb-5 pt-3">
              <InforCard
                {...formatCardItemProps(card)}
                onClick={() => {
                  router.push(
                    `/${getListingUrl(
                      get(card, "categories[0]"),
                      get(card, "categoryLinks[0].attributes.value"),
                      card.slug
                    )}`
                  );
                }}
              />
            </div>
          ))}
      </SectionLayout>
      <SectionLayout show={pagination.total > 0}>
        <Pagination
          limit={30}
          total={pagination.total}
          onPageChange={(selected) =>
            setPagination({ ...pagination, page: selected.selected })
          }
        />
      </SectionLayout>
      {/* <SectionLayout childrenClassName="flex justify-center">
        <Button variant="outlined" text="Load more" width={400} />
      </SectionLayout> */}
      {Array.isArray(articleArray) && articleArray.length > 0 && (
        <SectionLayout backgroundColor title="Articles">
          <Carousel responsive={homeCuratedResponsive}>
            {articleArray?.map((item, index) => (
              <Link href={`/articles/${item.slug}`} passHref key={index}>
                <div className="pb-5 pt-3 pl-3">
                  <ArticleCard
                    title={item.title}
                    imgUrl={item.imgUrl}
                    time={item.time}
                  />
                </div>
              </Link>
            ))}
          </Carousel>
        </SectionLayout>
      )}
      <div className={styles.introduction}>
        <SectionLayout transparent>
          <h1 className={styles.header}>
            A <span>Curated Platform & Experience</span>
            <p>For The Muslim Lifestyle</p>
          </h1>
          {curatedList.map((item, index) => (
            <div key={index} className="flex gap-3 mt-5">
              <Icon icon="star-2" color="#e60112" />
              <div>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.content}>{item.content}</div>
              </div>
            </div>
          ))}
        </SectionLayout>
      </div>
      <SectionLayout>
        <TopSearches />
      </SectionLayout>
    </div>
  );
};

export async function getServerSideProps(context :any){
  const { category, locale } = context.query;
  var metaTitle = "Tribes: Get travel information and recommendation for what to eat, buy, things to do, where to stay and how to get there";
  var metaDescription = "Explore and discover Muslim Friendly eateries";
  var dealArray: IType[] = [], 
      bannerArray:IType[] = [], 
      collectionArray:IType = [],
      categoryLinkArray:IType[] = [],
      articleArray:IType[] = [],
      categoryInfor:Ilisting = {};

  switch (category) {
    case CategoryText.EAT:
      switch (locale) {
        case "id":
          metaTitle = "Cari Restoran Halal di Singapura dan Pesan Makanan Online | Tribes"
          break;
        default:
          metaTitle = "Find Halal Restaurant in Singapore and Order Food Online | Tribes"
          break;
      }
      break;
    case CategoryText.BUY:
      metaTitle = "Browse Products | Tribes by HHWT";
      metaDescription ="Explore and discover Muslim Friendly products";
      break;
    case CategoryText.TRANSPORT:
      metaTitle = "Browse the Different Modes of Transport | Tribes by HHWT"
      metaDescription = "Explore and discover flights, ferries, buses and other modes of transport!"
      break;
    case CategoryText.STAY:
      metaTitle = "Browse Places to Stay | Tribes by HHWT";
      metaDescription = "Explore and discover the best places to stay!";
      break;
    case CategoryText.SEE_AND_DO:
      metaTitle = "Browse Activities & Sight-seeing spots | Tribes by HHWT";
      metaDescription = "Explore and discover exciting activities and sight-seeing spots!"
      break;
  }

  const dataExclusiveDeal = await BizListingApi.getListingCustom({
    categories: category,
    isExclusive: true,
    limit: 12,
    page: 1,
  });
  const rawListingExclusiveDealArray = formatBizlistingArray(
    get(dataExclusiveDeal, "data.data")
  );
  dealArray = rawListingExclusiveDealArray;

  const dataBanners = await BannerApi.getBannerCustom({
    categories: category,
    limit: 12,
    page: 1,
  });
  const rawListBanners = formatBanner(get(dataBanners, "data.data"));
  bannerArray = rawListBanners;

  const dataCollections = await CollectionApi.getCollectionCustom({
    categories: category,
    page: 1,
    limit: 12,
  });
  const rawListCollections = formatCollections(
    get(dataCollections, "data.data")
  );
  collectionArray = rawListCollections;

  const dataCategoryLinks =
    await CategoryLinkApi.getCategoryLinksByCategorySlug(category);
  const rawListCategoryLink = formatCategoryLink(
    get(dataCategoryLinks, "data.data")
  );
  categoryLinkArray = rawListCategoryLink;

  const dataArticles = await ArticleApi.getArticleCustomer({
    categories: category,
    page: 1,
    limit: 16,
  });
  const rawArticle = formatArticle(get(dataArticles, "data.data"));
  articleArray = rawArticle;

  let defaultCategoryInfor = {};
  switch (category) {
    case CategoryText.BUY:
      defaultCategoryInfor = {
        bannerSrc: "/images/banner-buy.jpg",
        bannerMobileSrc: "/images/buy-banner-mobile.jpg",
        categoryName: "Buy",
        categoryDescription: "Explore a range of items.",
      };
      break;
    case CategoryText.EAT:
      defaultCategoryInfor = {
        bannerSrc: "/images/eat-banner.jpg",
        bannerMobileSrc: "/images/eat-banner-mobile.jpg",
        categoryName: "Eat",
        categoryDescription:
          "Explore a wide array of cuisine types across different cultures.",
      };
      break;
    case CategoryText.SEE_AND_DO:
      defaultCategoryInfor = {
        bannerSrc: "/images/see-and-do-banner.jpg",
        bannerMobileSrc: "/images/see-and-do-banner-mobile.jpg",
        categoryName: "See and Do",
        categoryDescription:
          "Explore a wide array of cuisine types across different cultures.",
      };
      break;
    case CategoryText.STAY:
      defaultCategoryInfor = {
        bannerSrc: "/images/stay-banner.jpg",
        bannerMobileSrc: "/images/stay-banner-mobile.jpg",
        categoryName: "Stay",
        categoryDescription:
          "Explore famous attractions, key landmarks and experience localized activities. ",
      };
      break;
    case CategoryText.TRANSPORT:
      defaultCategoryInfor = {
        bannerSrc: "/images/transport-banner.jpg",
        bannerMobileSrc: "/images/transport-banner-mobile.jpg",
        categoryName: "Transport",
        categoryDescription: "Find the best way to get around.",
      };
      break;
  }
  categoryInfor = defaultCategoryInfor;

  return {
    props: {
      metaTitle: metaTitle,
      metaDescription: metaDescription,
      dealArray: dealArray,
      bannerArray: bannerArray,
      collectionArray: collectionArray,
      categoryLinkArray: categoryLinkArray,
      articleArray: articleArray,
      categoryInfor: categoryInfor
    }
  }
}

export default Category;
