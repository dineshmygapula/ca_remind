// components/wrappers/FormWrapper.tsx
import { ReactNode } from "react";
import { useForm, FormProvider, SubmitHandler, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, TypeOf } from "zod";

interface FormWrapperProps<TSchema extends ZodType<any, any>> {
    schema: TSchema;
    defaultValues: DefaultValues<TypeOf<TSchema>>;
    onSubmit: SubmitHandler<TypeOf<TSchema>>;
    children: ReactNode;
    formId?: string;
    className?: string;
}

export function FormWrapper<TSchema extends ZodType<any, any>>({
    schema,
    defaultValues,
    onSubmit,
    children,
    formId,
    className = "space-y-0",
}: FormWrapperProps<TSchema>) {
    const methods = useForm<TypeOf<TSchema>>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: "onBlur", // <-- replicates your old `touched` behavior automatically
    });

    return (
        <FormProvider {...methods}>
            <form id={formId} onSubmit={methods.handleSubmit(onSubmit)} className={className} noValidate>
                {children}
            </form>
        </FormProvider>
    );
}