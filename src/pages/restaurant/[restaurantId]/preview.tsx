import { Alert, Container, Text, useMantineTheme } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { NextSeo } from "next-seo";
import superjson from "superjson";

import type { GetServerSidePropsContext, NextPage } from "next";

import { Footer } from "src/components/Footer";
import { RestaurantMenu } from "src/components/RestaurantMenu";
import { appRouter } from "src/server/api/root";
import { createInnerTRPCContext } from "src/server/api/trpc";
import { api } from "src/utils/api";

/** Page that can be used to preview how the published menu would look like */
const RestaurantMenuPreviewPage: NextPage = () => {
    const router = useRouter();
    const theme = useMantineTheme();
    const t = useTranslations("preview");

    const { data: restaurant } = api.restaurant.getDetails.useQuery(
        { id: router.query?.restaurantId as string },
        { enabled: false }
    );

    return (
        <>
            <NextSeo description={t("seoDescription")} title={t("seoTitle")} />
            <main>
                <Container py="lg" size="xl">
                    <Alert
                        color="red"
                        data-testid="preview-mode-banner"
                        icon={<IconAlertCircle size={16} />}
                        mb="lg"
                        radius="lg"
                        title={t("alertTitle")}
                    >
                        <Text color={theme.black} weight="bold">
                            {t("alertContent")}
                        </Text>
                        <Text color={theme.black}>{t("alertDesc")}</Text>
                    </Alert>
                    {restaurant && <RestaurantMenu restaurant={restaurant} />}
                </Container>
            </main>
            <Footer />
        </>
    );
};

export const getServerSideProps = async (context: GetServerSidePropsContext<{ restaurantId: string }>) => {
    const session = await getSession(context);
    if (!session) {
        // This page should be only accessible once you are logged in
        return { redirect: { destination: "/" } };
    }
    const ssg = createProxySSGHelpers({
        ctx: createInnerTRPCContext({ session }),
        router: appRouter,
        transformer: superjson,
    });
    const restaurantId = context.params?.restaurantId as string;
    const messages = (await import("src/lang/en.json")).default;

    try {
        // Hydrate trpc context from server side
        const restaurant = await ssg.restaurant.getDetails.fetch({ id: restaurantId });
        if (restaurant.userId === session.user?.id) {
            // Preview page should only be accessible by the user who manages the restaurant
            return { props: { messages, trpcState: ssg.dehydrate() } };
        }
        return { redirect: { destination: "/" } };
    } catch {
        return { redirect: { destination: "/404" } };
    }
};

export default RestaurantMenuPreviewPage;
