import ListingInforCard from "components/BizHomePage/ListingInforCard/ListingInforCard";
import DealDetailModal from "components/DealDetailModal/DealDetailModal";
import InforCard from "components/InforCard/InforCard";
import Loader from "components/Loader/Loader";
import MenuCard from "components/MenuCard/MenuCard";
import ProductDetailModal from "components/ProductDetailModal/ProductDetailModal";
import PromotionCard from "components/PromotionCard/PromotionCard";
import SectionLayout from "components/SectionLayout/SectionLayout";
import TopSearches from "components/TopSearches/TopSearches";
import { CategoryText, ListingTabs } from "enums";
import { get, orderBy } from "lodash";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import BizListingApi from "services/biz-listing";
import {
  calcRateNumber,
  censoredPhoneNumber,
  formatCardItemProps,
  isPaidUser,
} from "utils";

import styles from "styles/Property.module.scss";
import TabsHorizontal from "components/TabsHorizontal/TabsHorizontal";
import { UserInforContext } from "Context/UserInforContext";
import MenuDetailModal from "components/MenuDetailModal/MenuDetailModal";

interface PropertiesContainerProps {
  cardItem?: any;
  list?: any[];
  onShowDetailModal?: (item: { [key: string]: any }) => void;
}

const PropertiesContainer = ({
  cardItem,
  list,
  onShowDetailModal,
}: PropertiesContainerProps) => {
  const CardItem = cardItem;
  return (
    <div className="flex flex-wrap gap-10">
      {Array.isArray(list) && list.length > 0 ? (
        list.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() => onShowDetailModal?.(formatCardItemProps(item))}
            >
              <CardItem {...formatCardItemProps(item)} />
            </div>
          );
        })
      ) : (
        <div>There is no data yet</div>
      )}
    </div>
  );
};

const Properties = (context) => {
  const { category, subCategory, listingSlug, property, listingInformation, phoneNumber, isPaid, isEatListing, isVerified } = context;
  const router = useRouter();
  const { user, updateUser } = useContext(UserInforContext);
  const upperCaseTitle = property?.[0].toUpperCase() + property?.slice(1);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState<string>(ListingTabs.PRODUCT);

  const TabList: any[] = [
    {
      label: "Deals",
      value: "deals",
    },
    {
      label: isEatListing ? "Dishes" : "Products",
      value: "products",
    },
    {
      label: "Menu",
      value: "menus",
    },
  ];

  useEffect(() => {
    setLoading(true);
    let userInfo = JSON.parse(localStorage.getItem("user") || "{}");
    setUserInfo(userInfo);

    if (property === "menus") {
      setSelectedTab("menus");
    } else if (property === "deals") {
      setSelectedTab("deals");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingSlug]);

  const handleShowDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  let DetailModal: any = ProductDetailModal;
  const renderProperties = () => {
    switch (property) {
      case ListingTabs.DISH:
        return (
          <PropertiesContainer
            cardItem={InforCard}
            list={listingInformation.products}
            onShowDetailModal={handleShowDetailModal}
          />
        );
      case ListingTabs.PRODUCT:
        return (
          <PropertiesContainer
            cardItem={InforCard}
            list={listingInformation.products}
            onShowDetailModal={handleShowDetailModal}
          />
        );
      case ListingTabs.SERVICE:
        return (
          <PropertiesContainer
            cardItem={InforCard}
            list={listingInformation.products}
            onShowDetailModal={handleShowDetailModal}
          />
        );
      case ListingTabs.DEAL:
        DetailModal = DealDetailModal;
        return (
          <PropertiesContainer
            cardItem={PromotionCard}
            list={listingInformation[property]}
            onShowDetailModal={handleShowDetailModal}
          />
        );
      case ListingTabs.MENU:
        DetailModal = MenuDetailModal;
        return (
          <PropertiesContainer
            cardItem={MenuCard}
            list={listingInformation[property]}
            onShowDetailModal={handleShowDetailModal}
          />
        );
    }
  };

  if (loading) {
    return (
      <SectionLayout childrenClassName="flex justify-center">
        <Loader />
      </SectionLayout>
    );
  }

  return (
    <div>
      <SectionLayout className={styles.listing_container}>
        <ListingInforCard
          isVerified={isVerified}
          isViewPage={true}
          logo={listingInformation.logo}
          isPaid={isPaid}
          phoneNumber={phoneNumber}
          socialInfo={listingInformation.website}
          priceRange={{
            min: listingInformation.min_price,
            max: listingInformation.max_price,
            currency: listingInformation.currecy,
          }}
          bizListing={listingInformation}
          userInfo={userInfo}
        />
      </SectionLayout>
      <SectionLayout>
        <div className="flex">
          <TabsHorizontal
            tablist={TabList}
            type="secondary-no-outline"
            selectedTab={selectedTab}
            className="pt-[6px]"
            onChangeTab={(property) => {
              setSelectedTab(property);
              router.push(
                `/${category}/${subCategory}/${listingSlug}/${property}/`,
                undefined,
                {
                  shallow: false,
                }
              );
            }}
          />
        </div>
      </SectionLayout>
      <SectionLayout>{renderProperties()}</SectionLayout>
      <SectionLayout>
        <TopSearches />
      </SectionLayout>
      <DetailModal
        isPaid={isPaid}
        visible={showDetailModal}
        data={selectedItem}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export async function getServerSideProps(props) {
  const { category, subCategory, listingSlug, property } = props.query;
  let isPaid = false;
  let isEatListing = false, phoneNumber = "";

  let data = await BizListingApi.getInfoBizListingBySlug(listingSlug);    
  const listingDetail = get(data, `data.data[0]`) || {};

  if (get(listingDetail, "categories[0].slug") === CategoryText.EAT) {
    isEatListing = true;
  }
  const rawPhoneNumber = listingDetail.phone_number;
  const defaultPhone = censoredPhoneNumber(rawPhoneNumber);
  if (isPaidUser(listingDetail.expiration_date)) {
    isPaid = isPaidUser(listingDetail.expiration_date);
    phoneNumber = rawPhoneNumber;
  } else {
    phoneNumber = defaultPhone;
  }
  const isVerified = listingDetail.is_verified;

  const listingInformation = listingDetail;

  // Pass data to the page via props
  return {
    props: {
      category: category || "",
      subCategory: subCategory || "",
      listingSlug: listingSlug || "",
      property: property || "",
      isEatListing: isEatListing,
      isPaid: isPaid,
      phoneNumber: phoneNumber,
      isVerified: isVerified,
      listingInformation: listingInformation
    },
  };
}
export default Properties;
