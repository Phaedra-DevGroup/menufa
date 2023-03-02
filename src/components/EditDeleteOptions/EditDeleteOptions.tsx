import type { FC } from "react";

import { ActionIcon, Loader, Menu, useMantineTheme } from "@mantine/core";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons";
import { useTranslations } from "next-intl";

export interface EditDeleteOptionsProps {
    /** Color of the menu icon */
    color?: string;
    /** Color of the menu icon when its hovered */
    hoverColor?: string;
    /** Whether or not to show the loader instead of the three dot menu */
    loading?: boolean;
    /** Event handler when delete option is clicked in the menu */
    onDeleteClick?: () => void;
    /** Event handler when edit option is clicked in the menu */
    onEditClick?: () => void;
}

/** Three dot menu to be shown in cards/items to allow users to trigger edit or delete form */
export const EditDeleteOptions: FC<EditDeleteOptionsProps> = ({
    loading,
    onEditClick,
    onDeleteClick,
    color,
    hoverColor,
}) => {
    const theme = useMantineTheme();
    const t = useTranslations("common");

    if (loading) {
        return <Loader size="sm" variant="oval" />;
    }
    return (
        <Menu shadow="md" styles={{ dropdown: { background: theme.white } }} width={150}>
            <Menu.Target>
                <ActionIcon
                    component="span"
                    data-testid="edit-delete-options"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                    sx={{
                        "&:hover": { background: "unset", color: hoverColor || theme.colors.primary[5] },
                        color: color || theme.colors.dark[5],
                        cursor: "pointer",
                        transition: "color 500ms ease",
                    }}
                >
                    <IconDotsVertical size={18} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                {onEditClick && (
                    <Menu.Item
                        color={theme.black}
                        data-testid="menu-item-edit"
                        icon={<IconEdit size={14} />}
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                            event.stopPropagation();
                            event.preventDefault();
                            onEditClick();
                        }}
                    >
                        {t("edit")}
                    </Menu.Item>
                )}
                {onDeleteClick && (
                    <Menu.Item
                        color="red"
                        data-testid="menu-item-delete"
                        icon={<IconTrash size={14} />}
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                            event.stopPropagation();
                            event.preventDefault();
                            onDeleteClick();
                        }}
                    >
                        {t("delete")}
                    </Menu.Item>
                )}
            </Menu.Dropdown>
        </Menu>
    );
};
