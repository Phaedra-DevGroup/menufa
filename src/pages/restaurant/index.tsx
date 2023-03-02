import type { FC } from "react";
import { useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Box, Center, Flex, Loader, SimpleGrid, Title } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons";
import { type NextPage } from "next";
import { useTranslations } from "next-intl";
import { NextSeo } from "next-seo";

import type { Image, Restaurant } from "@prisma/client";

import { AppShell } from "src/components/AppShell";
import { IconCard, ImageCard } from "src/components/Cards";
import { DeleteConfirmModal } from "src/components/DeleteConfirmModal";
import { RestaurantForm } from "src/components/Forms/RestaurantForm";
import { env } from "src/env/client.mjs";
import { api } from "src/utils/api";
import { showErrorToast, showSuccessToast } from "src/utils/helpers";

/** Image card that will represent each restaurant that the user created */
const RestaurantCard: FC<{ item: Restaurant & { image: Image | null } }> = ({ item }) => {
    const trpcCtx = api.useContext();
    const [restaurantFormOpen, setRestaurantFormOpen] = useState(false);
    const [deleteFormOpen, setDeleteFormOpen] = useState(false);
    const t = useTranslations("dashboard.restaurant");
    const tCommon = useTranslations("common");

    const { mutate: deleteRestaurant, isLoading: isDeleting } = api.restaurant.delete.useMutation({
        onError: (err) => showErrorToast(t("deleteError"), err),
        onSettled: () => setDeleteFormOpen(false),
        onSuccess: (data) => {
            trpcCtx.restaurant.getAll.setData(undefined, (restaurants) =>
                restaurants?.filter((restaurantItem) => restaurantItem.id !== data.id)
            );
            showSuccessToast(tCommon("deleteSuccess"), t("deleteSuccessDesc", { name: data.name }));
        },
    });

    return (
        <>
            <ImageCard
                editDeleteOptions={{
                    onDeleteClick: () => setDeleteFormOpen(true),
                    onEditClick: () => setRestaurantFormOpen(true),
                }}
                href={`/restaurant/${item.id}`}
                image={item.image}
                imageAlt={item.name}
                subTitle={item.location}
                testId={`restaurant-card-${item.name}`}
                title={item.name}
            />
            <RestaurantForm
                onClose={() => setRestaurantFormOpen(false)}
                opened={restaurantFormOpen}
                restaurant={item}
            />
            <DeleteConfirmModal
                description={t("deleteModalDesc")}
                loading={isDeleting}
                onClose={() => setDeleteFormOpen(false)}
                onDelete={() => deleteRestaurant({ id: item.id || "" })}
                opened={deleteFormOpen}
                title={t("deleteModalTitle", { name: item.name })}
            />
        </>
    );
};

/** Page to view all the restaurants that were created by you */
const RestaurantsListPage: NextPage = () => {
    const [restaurantFormOpen, setRestaurantFormOpen] = useState(false);
    const t = useTranslations("dashboard.restaurant");
    const { data: restaurants, isLoading } = api.restaurant.getAll.useQuery(undefined, {
        onError: () => showErrorToast(t("fetchRestaurantsError")),
    });
    const [gridItemParent] = useAutoAnimate<HTMLDivElement>();
    const [rootParent] = useAutoAnimate<HTMLDivElement>();

    return (
        <>
            <NextSeo description={t("seoDescription")} title={t("seoTitle")} />
            <main>
                <AppShell>
                    <Flex align="center" justify="space-between">
                        <Title order={1}>{t("headerTitle")}</Title>
                    </Flex>
                    <Box mt="xl" ref={rootParent}>
                        {isLoading ? (
                            <Center h="50vh" w="100%">
                                <Loader size="lg" />
                            </Center>
                        ) : (
                            <SimpleGrid
                                breakpoints={[
                                    { cols: 3, minWidth: "lg" },
                                    { cols: 2, minWidth: "sm" },
                                    { cols: 1, minWidth: "xs" },
                                ]}
                                mt="md"
                                ref={gridItemParent}
                            >
                                {restaurants?.map((item) => (
                                    <RestaurantCard key={item.id} item={item} />
                                ))}
                                {restaurants &&
                                    restaurants?.length < Number(env.NEXT_PUBLIC_MAX_RESTAURANTS_PER_USER) && (
                                        <IconCard
                                            key="add-new-restaurant"
                                            Icon={IconCirclePlus}
                                            onClick={() => setRestaurantFormOpen(true)}
                                            subTitle={t("addNewCardSubTitle")}
                                            testId="add-new-restaurant"
                                            title={t("addNewCardTitle")}
                                        />
                                    )}
                            </SimpleGrid>
                        )}
                    </Box>
                </AppShell>
                <RestaurantForm onClose={() => setRestaurantFormOpen(false)} opened={restaurantFormOpen} />
            </main>
        </>
    );
};

export const getStaticProps = async () => ({ props: { messages: (await import("src/lang/en.json")).default } });

export default RestaurantsListPage;
