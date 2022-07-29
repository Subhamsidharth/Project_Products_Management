const test = async function(){
    const pass = bcrypt.hashSync("12345", 10);
    // const pass = await bcrypt.hash("12345", 10);
    const comparison = await bcrypt.compare("12346", pass);


    console.log(pass);
    console.log(comparison);
    return "jhjh"
}

test()