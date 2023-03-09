import type { FC, MutableRefObject } from "react";

import {
    BackgroundImage,
    Box,
    Button,
    Container,
    Group,
    Overlay,
    SimpleGrid,
    Textarea,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { env } from "src/env/client.mjs";
import { showErrorToast, showSuccessToast } from "src/utils/helpers";

import { useStyles } from "./style";

export const ContactUs: FC<{ contactUsRef: MutableRefObject<HTMLDivElement> }> = ({ contactUsRef }) => {
    const { classes, theme, cx } = useStyles();
    const t = useTranslations("landing.contactUs");

    const form = useForm({
        initialValues: { email: "", message: "", name: "", subject: "" },
        validate: zodResolver(
            z.object({
                email: z.string().email(),
                message: z.string().min(1, "Message is required"),
                name: z.string().min(1, "Name is required"),
                subject: z.string().min(1, "Subject is required"),
            })
        ),
    });

    const { mutate: submitContactUs, isLoading: submittingContactUs } = useMutation(
        async (data: string) => {
            if (env.NEXT_PUBLIC_FORM_API_KEY) {
                const formResponse = await fetch("https://api.web3forms.com/submit", {
                    body: data,
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    method: "POST",
                });
                return formResponse.json();
            }
            return null;
        },
        {
            onError: () => showErrorToast(t("errorToastTitle"), { message: t("errorToastDesc") }),
            onSuccess: () => {
                showSuccessToast(t("successToastTitle"), t("successToastDesc"));
                form.reset();
            },
        }
    );

    return (
        <BackgroundImage className={classes.parallaxBg} src="landing-restaurant-bg.avif">
            <Container className={cx(classes.stepperWrap, classes.contactUsContainer)} ref={contactUsRef} size="xl">
                <Overlay blur={5} color={theme.white} opacity={0.7} zIndex={0} />
                <Box className={classes.stepperContents}>
                    <form
                        onSubmit={form.onSubmit((values) => {
                            submitContactUs(
                                JSON.stringify({
                                    access_key: env.NEXT_PUBLIC_FORM_API_KEY,
                                    email: values.email,
                                    message: values.message,
                                    name: values.name,
                                    subject: `Menufic | ${values.subject}`,
                                })
                            );
                        })}
                    >
                        <Title className={classes.sectionTitle}>{t("title")}</Title>

                        <SimpleGrid breakpoints={[{ cols: 1, maxWidth: "sm" }]} cols={2} mt="xl">
                            <TextInput
                                label={t("name.label")}
                                name="name"
                                placeholder={t("name.placeholder")}
                                {...form.getInputProps("name")}
                            />
                            <TextInput
                                label={t("email.label")}
                                name="email"
                                placeholder={t("email.placeholder")}
                                {...form.getInputProps("email")}
                            />
                        </SimpleGrid>

                        <TextInput
                            label={t("subject.label")}
                            mt="md"
                            name="subject"
                            placeholder={t("subject.placeholder")}
                            {...form.getInputProps("subject")}
                        />
                        <Textarea
                            autosize
                            label={t("message.label")}
                            maxRows={10}
                            minRows={5}
                            mt="md"
                            name="message"
                            placeholder={t("message.placeholder")}
                            {...form.getInputProps("message")}
                        />

                        <Group mt="xl" position="center">
                            <Button loading={submittingContactUs} size="md" type="submit">
                                {t("submitButtonLabel")}
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Container>
        </BackgroundImage>
    );
};
