var express = require("express");
var app = express();
var formidable = require('formidable');
var fs = require('fs');
const delay = require('delay');



var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var thongbao;

const program = require('commander');

'use strict';


// cau hinh ejs
app.set("view engine", "ejs");
app.set("views", "./views");

var defaultConfig = require("./config");
var path = require('path');



var store_path = path.join(__dirname, 'wallet/admin');

// 

/////////////////////////////////////////////////
app.use(express.static('public'));


const config = Object.assign({}, defaultConfig, {
    channelName: "mychannel",
    user: "user1",
    storePath: store_path

});

var controller = require("./controller")(config);

var request = {
    //targets : --- letting this default to the peers assigned to the channel
    chaincodeId: "demo2",
    fcn: "",
    args: ['']
};
                            
//////--->
app.get("/home", function(req, res){
    res.render("index");
});

app.get("/create-contract", function(req, res){
    res.render("bankA/create_contract");
});

// app.get("/app.js", (req,res)=>{
//     res.render ("product/app");
// })

app.get("/view-lc/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getResultByRefID";
        request.args = [id];
        console.log(request);
        
        controller
        .query(config.user, request)
        .then(async ret => {
            product = JSON.parse(ret.toString())[0];
            if (typeof product !== "undefined") {
                
                console.log("product: ", product);
                request.args = [''];
                id = product.id_transaction;
                var dataNews = [];
                
                while (true) {
                    var dataNew = {
                        tx_id: "",
                        timestamp: "",
                        status_client: "",
                        status_seller: "",
                        shipped: "",
                        received: ""
                    };
                    data = await controller.getTransactionByID(config.user, id);
                    dataNew.tx_id = data.header.channel_header.tx_id;
                    dataNew.timestamp = data.header.channel_header.timestamp;
                    value = data.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[0].rwset.writes[0].value
                    valueNew = JSON.parse(value);
                    dataNew.status_client = valueNew.client.status;
                    dataNew.status_seller = valueNew.seller.status;
                    dataNew.shipped = valueNew.seller.shipped;
                    dataNew.received = valueNew.client.received;
                    if (dataNew.shipped != "await") {
                        dataNews.push(dataNew);
                    }
                    
                    id = valueNew.prev_id_transaction;
                    if (id == "") {
                        console.log(dataNews)
                        break;
                    }
                }
                res.render("contract/lc", { product : product, datas: dataNews});
            } else {
                console.log("Loi khong tim thay");
                res.render("404_notfound")
            }
        })
        .catch(err => {
            console.error(err);
        });

    }
    else {
        res.render("");
    }
});

app.get("/get-contract/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getResultByRefID";
        request.args = [id];
        console.log(request);
        
        controller
        .query(config.user, request)
        .then(ret => {
            product = JSON.parse(ret.toString())[0];
            if (typeof product !== "undefined") {
                console.log("product: ", product);
                request.args = [''];
                res.render("contract/contract_product", { product : product});
            } else {
                console.log("Loi khong tim thay");
                res.render("404_notfound")
            }
        })
        .catch(err => {
            console.error(err);
        });

    }
    else {
        res.render("");
    }
});

app.get("/get-contract-seller/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getResultByRefID";
        request.args = [id];
        console.log(request);
        
        controller
        .query(config.user, request)
        .then(ret => {
            product = JSON.parse(ret.toString())[0];
            if (typeof product !== "undefined") {
                console.log("product: ", product);
                request.args = [''];
                res.render("contract/contract_product_seller", { product : product});
            } else {
                console.log("Loi khong tim thay");
                res.render("404_notfound")
            }
        })
        .catch(err => {
            console.error(err);
        });

    }
    else {
        res.render("");
    }
});

app.get("/get-contract-seller-end/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getResultByRefID";
        request.args = [id];
        console.log(request);
        
        controller
        .query(config.user, request)
        .then(ret => {
            product = JSON.parse(ret.toString())[0];
            if (typeof product !== "undefined") {
                console.log("product: ", product);
                request.args = [''];
                res.render("contract/contract_product_seller_end", { product : product});
            } else {
                console.log("Loi khong tim thay");
                res.render("404_notfound")
            }
        })
        .catch(err => {
            console.error(err);
        });

    }
    else {
        res.render("");
    }
});

app.post("/create-contract", urlencodedParser, function(req, res){
   
    var product = [];
    var form =  new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(fields)
        product[0] = fields.name
        product[1] = fields.price
        product[2] = fields.total
        product[3] = fields.name_app
        product[4] = fields.company_app
        product[5] = fields.iban_app
        product[6] = fields.code_app
        product[7] = fields.bank_name_app
        product[8] = fields.name_sub
        product[9] = fields.company_sub
        product[10] = fields.iban_sub
        product[11] = fields.code_sub
        product[12] = fields.bank_name_sub


        request.fcn = "initContract";
        request.args = product;

        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/client-a?type_get=create-contract");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.render("/client-a?type_get=200");
        });
        
    })

});

app.get("/client-a",function(req, res){
    check = req.query.type_get
    console.log("check: ", check);
    if (check == "create-contract") {
        thongbao = "create-contract";
    } else if (check == "update-received") {
        thongbao = "update-received";
    } else {
        thongbao = "200";
    }
    request.fcn = "getAllProduct";
    console.log(request);
        
        controller
            .query(config.user, request)
            .then(ret => {

                products = JSON.parse(ret.toString());
                console.log("products: ", products);
                if (typeof products !== "undefined") {
                    request.args = [''];
                    res.render("bankA/client", {products : products, thongbao: thongbao});
                } else {
                    console.log("Loi khong tim thay");
                    res.render("404_notfound")
                }
            })
            .catch(err => {
                console.error(err);
            });
});

app.get("/manager-a",function(req, res){
    check = req.query.type_get
    console.log("check: ", check);
    if (check == "update-client") {
        thongbao = "update-client";
    }else  if (check == "client-payment") {
        thongbao = "client-payment";
    } else {
        thongbao = "200";
    }
    request.fcn = "getAllProduct";
    console.log(request);
        
        controller
            .query(config.user, request)
            .then(ret => {
                products = JSON.parse(ret.toString());
                console.log("products: ", products);
                if (typeof products !== "undefined") {
                    request.args = [''];
                    res.render("bankA/manager", {products : products, thongbao: thongbao });
                } else {
                    console.log("Loi khong tim thay");
                    res.render("404_notfound")
                }
            })
            .catch(err => {
                console.error(err);
            });
});

app.get("/manager-b",function(req, res){
    check = req.query.type_get
    console.log("check: ", check);
    if (check == "update-seller") {
        thongbao = "update-seller";
    }else if (check == "seller-payment") {
        thongbao = "seller-payment";
    } else {
        thongbao = "200";
    }
    request.fcn = "getAllProduct";
    console.log(request);
        
        controller
            .query(config.user, request)
            .then(ret => {
                products = JSON.parse(ret.toString());
                console.log("products: ", products);
                if (typeof products !== "undefined") {
                    request.args = [''];
                    res.render("bankB/manager", {products : products, thongbao: thongbao });
                } else {
                    console.log("Loi khong tim thay");
                    res.render("404_notfound")
                }
            })
            .catch(err => {
                console.error(err);
            });
});

app.get("/client-b",function(req, res){
    check = req.query.type_get
    console.log("check: ", check);
    if (check == "update-seller-end") {
        thongbao = "update-seller-end";
    } else if (check == "update-shipped") {
        thongbao = "update-shipped";
    } else if (check == "update-shipped-end") {
        thongbao = "update-shipped-end";
    } else {
        thongbao = "200";
    }
    request.fcn = "getAllProduct";
    console.log(request);
        
        controller
            .query(config.user, request)
            .then(ret => {

                products = JSON.parse(ret.toString());
                console.log("products: ", products);
                if (typeof products !== "undefined") {
                    request.args = [''];
                    res.render("bankB/client", {products : products, thongbao: thongbao});
                } else {
                    console.log("Loi khong tim thay");
                    res.render("404_notfound")
                }
            })
            .catch(err => {
                console.error(err);
            });
});

app.get("/update-status-client-reject/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusClient";
        request.args = [id,'client-reject'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/manager-a?type_get=update-client");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/manager-a");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-status-client-accept/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusClient";
        request.args = [id,'client-accept'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/manager-a?type_get=update-client");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/manager-a");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-status-seller-reject/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusSeller";
        request.args = [id,'seller-reject'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            res.redirect("/manager-b");
        })
        .catch(err => {
            console.error(err);
            res.redirect("/manager-b");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-status-seller-accept/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusSeller";
        request.args = [id,'seller-accept'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/manager-b?type_get=update-seller");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/manager-b");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-status-seller-reject-end/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusSeller";
        request.args = [id,'seller-reject-full'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            res.redirect("/client-b");
        })
        .catch(err => {
            console.error(err);
            res.redirect("/client-b");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-status-seller-accept-end/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusSeller";
        request.args = [id,'seller-accept-full'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/client-b?type_get=update-seller-end");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/client-b");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-seller-shipped/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateShipped";
        request.args = [id,'success'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/list-order?type_get=update-seller-shipped");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/list-order");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-received/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateReceived";
        request.args = [id,'success'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/client-a?type_get=update-received");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/client-a");
        });

    }
    else {
        res.render("");
    }
});

app.get("/client-payment/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusClient";
        request.args = [id,'client-payment'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/manager-a?type_get=client-payment");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/manager-a");
        });

    }
    else {
        res.render("");
    }
});

app.get("/seller-payment/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusSeller";
        request.args = [id,'seller-closed'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/manager-b?type_get=seller-payment");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/manager-b");
        });

    }
    else {
        res.render("");
    }
});



app.get("/send-order/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateShipped";
        request.args = [id,'await'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/client-b?type_get=update-shipped");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/client-b");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-order/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getResultByRefID";
        request.args = [id];
        console.log(request);
        
        controller
        .query(config.user, request)
        .then(ret => {
            product = JSON.parse(ret.toString())[0];
            if (typeof product !== "undefined") {
                console.log("product: ", product);
                request.args = [''];
                res.render("shipper/order", { product : product});
            } else {
                console.log("Loi khong tim thay");
                res.render("404_notfound")
            }
        })
        .catch(err => {
            console.error(err);
        });

    }
    else {
        res.render("");
    }
});

app.post("/update-order/:id", urlencodedParser, function(req, res){
    var id = req.params.id;
    var product = [];
    var form =  new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        product[0] = id;
        product[1] = fields.company;
        product[2] = fields.date;
        product[3] = fields.fee;

        request.fcn = "updateOrder";
        request.args = product;

        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            
            request.args = [''];
            setTimeout(function() {
                res.redirect("/list-order?type_get=update-order");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/list-order");
        });
        
    })

});

app.get("/list-order",function(req, res){
    check = req.query.type_get
    console.log("check: ", check);
    if (check == "update-order") {
        thongbao = "update-order";
    } else if  (check == "update-seller-shipped") {
        thongbao = "update-seller-shipped";
    } else {
        thongbao = "200";
    }
    request.fcn = "getAllProduct";
    console.log(request);
        
        controller
            .query(config.user, request)
            .then(ret => {

                products = JSON.parse(ret.toString());
                console.log("products: ", products);
                if (typeof products !== "undefined") {
                    request.args = [''];
                    res.render("shipper/list_order", {products : products, thongbao: thongbao });
                } else {
                    console.log("Loi khong tim thay");
                    res.render("404_notfound")
                }
            })
            .catch(err => {
                console.error(err);
            });
});

app.get("/get-order/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getResultByRefID";
        request.args = [id];
        console.log(request);
        
        controller
        .query(config.user, request)
        .then(ret => {
            product = JSON.parse(ret.toString())[0];
            if (typeof product !== "undefined") {
                console.log("product: ", product);
                request.args = [''];
                res.render("bankB/order", { product : product});
            } else {
                console.log("Loi khong tim thay");
                res.render("404_notfound")
            }
        })
        .catch(err => {
            console.error(err);
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-shipped-reject/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateShipped";
        request.args = [id,'await'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            res.redirect("/client-b");
        })
        .catch(err => {
            console.error(err);
            res.redirect("/client-b");
        });

    }
    else {
        res.render("");
    }
});

app.get("/update-shipped-accept/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "updateStatusSeller";
        request.args = [id,'shipped'];
        console.log(request);
        
        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            request.args = [''];
            setTimeout(function() {
                res.redirect("/client-b?type_get=update-shipped-end");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            res.redirect("/client-b");
        });

    }
    else {
        res.render("");
    }
});


app.listen(4200);
