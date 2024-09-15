export async function validateResponse(response) {
    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Error fetching data');
    }

    return response;
}
