import { FormInstance } from "antd/lib/form";


export async function isFormValidatedOk(form: FormInstance): Promise<boolean> {
    try {
        await form.validateFields();
        return true;
    }
    catch{
        return false;
    }
}