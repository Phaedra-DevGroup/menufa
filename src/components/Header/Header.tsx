import type { Dispatch, FC, SetStateAction } from "react";

import {
    ActionIcon,
    Avatar,
    Burger,
    Button,
    Container,
    createStyles,
    Flex,
    Group,
    Header,
    MediaQuery,
    Menu,
    Popover,
    Text,
    Transition,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconEyeglass2, IconHome, IconLogin, IconLogout, IconMoonStars, IconPizza, IconSun } from "@tabler/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { LoginOptions } from "../LoginOptions";
import { Logo } from "../Logo";

interface Props {
    /** Whether or not the hamburger menu is open when on mobile device */
    opened?: boolean;
    /** Update the state of the hamburger menu opened state */
    setOpened?: Dispatch<SetStateAction<boolean>>;
    showInternalLinks?: boolean;
    /**
     * Whether or not to show the login button in the header.
     * Since this button on only relaxant on screens that are publicly accessible
     */
    showLoginButton?: boolean;
    withShadow?: boolean;
}

const useStyles = createStyles((theme, params: { withShadow?: boolean }) => ({
    avatarIcon: { "&:hover": { boxShadow: theme.shadows.xs }, border: `1px solid ${theme.colors.dark[3]}` },
    dashboardActionIcon: {
        "&:hover": { backgroundColor: theme.colors.primary[6], boxShadow: theme.shadows.xs },
        backgroundColor: theme.colors.primary[5],
        color: theme.white,
    },
    header: {
        background: theme.colors.dark[0],
        boxShadow: params.withShadow ? theme.shadows.xs : undefined,
        padding: theme.spacing.md,
    },
    headerContainer: { alignItems: "center", display: "flex", height: "100%" },
    headerLinksWrap: { alignItems: "center", flex: 1, paddingLeft: 50, paddingTop: 5 },
    linkActive: { color: theme.colors.primary[6] },
    popoverLink: {
        paddingBottom: theme.spacing.md,
        paddingLeft: theme.spacing.lg,
        paddingRight: theme.spacing.lg,
        paddingTop: theme.spacing.md,
    },
    popoverWrap: { width: "100% !important" },
    themeSwitch: {
        "&:hover": { boxShadow: theme.shadows.xs },
        border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[5]}`,
        color: theme.colorScheme === "dark" ? theme.colors.yellow[3] : theme.colors.gray[7],
    },
}));

/** Header to be used throughout the app */
export const NavHeader: FC<Props> = ({
    opened = false,
    setOpened,
    showLoginButton,
    withShadow,
    showInternalLinks = false,
}) => {
    const theme = useMantineTheme();
    const { data: sessionData, status } = useSession();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`);
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const { classes, cx } = useStyles({ withShadow });
    const router = useRouter();
    const t = useTranslations();

    const linkOptions = [
        { icon: IconPizza, label: t("dashboard.restaurant.navTitle"), link: "/restaurant" },
        { icon: IconEyeglass2, label: t("dashboard.explore.navTitle"), link: "/explore" },
    ];

    return (
        <Header className={classes.header} height={60}>
            <Container className={classes.headerContainer} size="xl">
                {showInternalLinks && setOpened && (
                    <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                        <Popover
                            onChange={setOpened}
                            opened={opened}
                            position="bottom"
                            radius="xs"
                            shadow="md"
                            transition="scale-y"
                            width={200}
                        >
                            <Popover.Target>
                                <Burger
                                    color={theme.colors.dark[6]}
                                    mr="xl"
                                    onClick={() => setOpened((o) => !o)}
                                    opened={opened}
                                    size="sm"
                                />
                            </Popover.Target>
                            <Popover.Dropdown className={classes.popoverWrap}>
                                {linkOptions.map((link) => (
                                    <Link
                                        key={link.link}
                                        className={cx({
                                            [classes.linkActive]: router.pathname.startsWith(link.link),
                                        })}
                                        data-testid={`header-link-${link.label.toLowerCase()}`}
                                        href={link.link}
                                    >
                                        <Text className={classes.popoverLink} size="lg">
                                            {link.label}
                                        </Text>
                                    </Link>
                                ))}
                            </Popover.Dropdown>
                        </Popover>
                    </MediaQuery>
                )}

                <Flex align="center" justify="space-between" w="100%">
                    <Logo />
                    {showInternalLinks && (
                        <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                            <Flex className={classes.headerLinksWrap}>
                                {linkOptions.map((link) => (
                                    <Link
                                        key={link.link}
                                        className={cx({
                                            [classes.linkActive]: router.pathname.startsWith(link.link),
                                        })}
                                        data-testid={`header-link-${link.label.toLowerCase()}`}
                                        href={link.link}
                                    >
                                        <Text className={classes.popoverLink} size="md">
                                            {link.label}
                                        </Text>
                                    </Link>
                                ))}
                            </Flex>
                        </MediaQuery>
                    )}

                    <Transition mounted={status !== "loading"} transition="fade">
                        {(styles) => (
                            <Group align="center" spacing="lg" style={styles}>
                                {status !== "loading" && showLoginButton && (
                                    <>
                                        {status === "authenticated" ? (
                                            <Link href="/restaurant">
                                                {isMobile ? (
                                                    <ActionIcon className={classes.dashboardActionIcon} size={36}>
                                                        <IconHome />
                                                    </ActionIcon>
                                                ) : (
                                                    <Button size="md">{t("common.openDashboard")}</Button>
                                                )}
                                            </Link>
                                        ) : (
                                            <LoginOptions>
                                                {isMobile ? (
                                                    <ActionIcon className={classes.dashboardActionIcon} size={36}>
                                                        <IconLogin />
                                                    </ActionIcon>
                                                ) : (
                                                    <Button leftIcon={<IconLogin />} size="md">
                                                        {t("common.login")}
                                                    </Button>
                                                )}
                                            </LoginOptions>
                                        )}
                                    </>
                                )}

                                <ActionIcon
                                    aria-label="theme-switch"
                                    className={classes.themeSwitch}
                                    data-testid="theme-toggle-button"
                                    onClick={() => toggleColorScheme()}
                                    size={36}
                                >
                                    {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoonStars size={18} />}
                                </ActionIcon>

                                {status === "authenticated" && (
                                    <Menu
                                        position="top-end"
                                        shadow="xl"
                                        styles={{ dropdown: { background: theme.white } }}
                                    >
                                        <Menu.Target>
                                            <ActionIcon>
                                                <Avatar
                                                    className={classes.avatarIcon}
                                                    color="primary"
                                                    imageProps={{ referrerPolicy: "no-referrer" }}
                                                    src={sessionData?.user?.image}
                                                >
                                                    {sessionData?.user?.name?.[0]}
                                                </Avatar>
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Text color={theme.colors.dark[7]} miw={200} px="md" py="sm">
                                                {sessionData?.user?.name}
                                            </Text>

                                            <Menu.Item
                                                color="red"
                                                icon={<IconLogout stroke={1.5} />}
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                            >
                                                {t("common.logout")}
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                        )}
                    </Transition>
                </Flex>
            </Container>
        </Header>
    );
};
