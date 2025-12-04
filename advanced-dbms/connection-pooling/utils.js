
export function prepareRow(){
    const employyed = Math.random() % 2;
    const first = Math.random().toString(36).substring(2, 10);
    const last = Math.random().toString(36).substring(2, 10);
    const ss = Math.random().toString(36).substring(2, 5);

    const query = `insert into student values(${employyed}, '${first}', '${last}', '${ss}')`;
    return query;
}