import request from "../utils/httpRequest"
import parseToken from "../utils/parseToken"

export const fetchProposal = async (type="warehouse", id, status='COMPLETED', page = 1) => {
    try{
        const option = {}
        if(type == "warehouse") option.warehouseID = id
        else option.employeeIDCreate = id
        const token = parseToken("tokenUser")
        const warehouse = parseToken('warehouse')
        const res = await request.post(
                    '/api/proposal/filter-proposal',
                    {
                        status,
                        page,
                        ...option
                    },
                    {
                        headers: {
                            token: `Beare ${token.accessToken}`,
                            employeeid: token.employeeID,
                            warehouseid: warehouse.warehouseID,
                        },
                    },
                );
        return res.data
    }catch(err) {
        throw new Error(err)
    }
}