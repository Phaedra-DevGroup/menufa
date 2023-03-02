import type { FC } from "react";
import { useEffect, useState } from "react";

import { Button, Group, Stack, Text, useMantineTheme } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useTranslations } from "next-intl";

import type { ModalProps } from "@mantine/core";

import { api } from "src/utils/api";
import { showErrorToast, showSuccessToast } from "src/utils/helpers";
import { bannerInput } from "src/utils/validators";

import { ImageUpload } from "../ImageUpload";
import { Modal } from "../Modal";

interface Props extends ModalProps {
    /** Id of the restaurant for the the banner needs to be attached to */
    restaurantId: string;
}

/** Form to be used when allowing users to upload banners for restaurant */
export const BannerForm: FC<Props> = ({ opened, onClose, restaurantId, ...rest }) => {
    const trpcCtx = api.useContext();
    const theme = useMantineTheme();
    const [imagePath, setImagePath] = useState("");
    const t = useTranslations("dashboard.banner");
    const tCommon = useTranslations("common");

    const { mutate: addBanner, isLoading: isCreating } = api.restaurant.addBanner.useMutation({
        onError: (err) => showErrorToast(t("createError"), err),
        onSuccess: (data) => {
            onClose();
            trpcCtx.restaurant.getBanners.setData({ id: restaurantId }, (banners = []) => [...banners, data]);
            showSuccessToast(tCommon("createSuccess"), t("createSuccessDesc"));
        },
    });

    const { onSubmit, setValues, isDirty, resetDirty, errors } = useForm({
        initialValues: { imageBase64: "", restaurantId },
        validate: zodResolver(bannerInput),
    });

    useEffect(() => {
        if (opened) {
            setImagePath("");
            const values = { imageBase64: "", restaurantId };
            setValues(values);
            resetDirty(values);
        }
    }, [restaurantId, opened]);

    return (
        <Modal loading={isCreating} onClose={onClose} opened={opened} title={t("addModalTitle")} {...rest}>
            <form
                onSubmit={onSubmit((values) => {
                    if (isDirty()) {
                        addBanner(values);
                    } else {
                        onClose();
                    }
                })}
            >
                <Stack spacing="sm">
                    <ImageUpload
                        disabled={isCreating}
                        error={!!errors.imageBase64}
                        height={400}
                        imageRequired
                        imageUrl={imagePath}
                        onImageCrop={(imageBase64, newImagePath) => {
                            setValues({ imageBase64 });
                            setImagePath(newImagePath);
                        }}
                        onImageDeleteClick={() => {
                            setValues({ imageBase64: "" });
                            setImagePath("");
                        }}
                        width={1000}
                    />
                    <Text color={theme.colors.red[7]} size="xs">
                        {errors.imageBase64}
                    </Text>
                    <Group mt="md" position="right">
                        <Button data-testid="save-banner-form" loading={isCreating} px="xl" type="submit">
                            {tCommon("save")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
};
