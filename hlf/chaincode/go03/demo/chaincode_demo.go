package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// ChaincodeDemo example simple Chaincode implementation
type ChaincodeDemo struct {
}

type Demo struct {
	AppRequest        AppRequest `json:"app_request"`
	SubRequest        SubRequest `json:"sub_request"`
	Product           Product    `json:"product"`
	Client            Client     `json:"client"`
	Seller            Seller     `json:"seller"`
	Order             Order      `json:"order"`
	IDTransaction     string     `json:"id_transaction"`
	PrevIDTransaction string     `json:"prev_id_transaction"`
}

type AppRequest struct {
	Name        string `json:"name"`
	CompanyName string `json:"company_name"`
	IBan        string `json:"i_ban"`
	SwiftCode   string `json:"swift_code"`
	BankName    string `json:"bank_name"`
}

type SubRequest struct {
	Name        string `json:"name"`
	CompanyName string `json:"company_name"`
	IBan        string `json:"i_ban"`
	SwiftCode   string `json:"swift_code"`
	BankName    string `json:"bank_name"`
}

type Product struct {
	RefID      string `json:"ref_id"`
	Name       string `json:"name"`
	Price      string `json:"price"`
	TotalPrice string `json:"total_price"`
}

type Client struct {
	Status   string `json:"status"`
	Received string `json:"received"`
}

type Seller struct {
	Status  string `json:"status"`
	Shipped string `json:"shipped"`
}

type Order struct {
	Name string `json:"name"`
	Date string `json:"date"`
	Fee  string `json:"fee"`
}

func (t *ChaincodeDemo) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("fish infomation init")
	return shim.Success(nil)
}

func (t *ChaincodeDemo) initContract(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	//   0           1       		2           3			 4
	if len(args) < 14 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	StatusC := "New"
	var Received string
	StatusS := "New"
	var Shipped string
	var Order Order
	var PrevIDTransaction string

	rand.Seed(time.Now().UnixNano())
	RefID := strconv.Itoa(rand.Intn(100) + 1)

	IDTransaction := args[0]
	Name := args[1]
	Price := args[2]
	TotalPrice := args[3]
	NameApp := args[4]
	CompanyNameApp := args[5]
	IBanApp := args[6]
	SwiftCodeApp := args[7]
	BankNameApp := args[8]
	NameSub := args[9]
	CompanyNameSub := args[10]
	IBanSub := args[11]
	SwiftCodeSub := args[12]
	BankNameSub := args[13]

	var AppRequest AppRequest
	var SubRequest SubRequest
	var Product Product
	var Client Client
	var Seller Seller

	AppRequest.Name = NameApp
	AppRequest.CompanyName = CompanyNameApp
	AppRequest.IBan = IBanApp
	AppRequest.SwiftCode = SwiftCodeApp
	AppRequest.BankName = BankNameApp

	SubRequest.Name = NameSub
	SubRequest.CompanyName = CompanyNameSub
	SubRequest.IBan = IBanSub
	SubRequest.SwiftCode = SwiftCodeSub
	SubRequest.BankName = BankNameSub

	Product.RefID = RefID
	Product.Name = Name
	Product.Price = Price
	Product.TotalPrice = TotalPrice

	Client.Status = StatusC
	Client.Received = Received

	Seller.Status = StatusS
	Seller.Shipped = Shipped

	// ==== Create product object and marshal to JSON ====
	result := &Demo{AppRequest, SubRequest, Product, Client, Seller, Order, IDTransaction, PrevIDTransaction}
	resultJSONasBytes, err := json.Marshal(result)
	if err != nil {
		return shim.Error(err.Error())
	}

	// === Save product to state ===
	err = stub.PutState(RefID, resultJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (t *ChaincodeDemo) updateOrder(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//
	if len(args) < 5 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	IDTransaction := args[0]
	RefID := args[1]
	Name := args[2]
	Date := args[3]
	Fee := args[4]

	resultAsBytes, err := stub.GetState(RefID)
	if err != nil {
		return shim.Error("Failed to get result:" + err.Error())
	} else if resultAsBytes == nil {
		return shim.Error("result does not exist")
	}

	resultOld := Demo{}
	err = json.Unmarshal(resultAsBytes, &resultOld)
	if err != nil {
		return shim.Error(err.Error())
	}

	resultOld.PrevIDTransaction = resultOld.IDTransaction
	resultOld.IDTransaction = IDTransaction

	resultOld.Order.Name = Name
	resultOld.Order.Date = Date
	resultOld.Order.Fee = Fee

	resultJSONasBytes, _ := json.Marshal(resultOld)
	err = stub.PutState(RefID, resultJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (t *ChaincodeDemo) updateStatusClient(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//
	if len(args) < 3 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	IDTransaction := args[0]
	RefID := args[1]
	Status := args[2]

	resultAsBytes, err := stub.GetState(RefID)
	if err != nil {
		return shim.Error("Failed to get result:" + err.Error())
	} else if resultAsBytes == nil {
		return shim.Error("result does not exist")
	}

	resultOld := Demo{}
	err = json.Unmarshal(resultAsBytes, &resultOld)
	if err != nil {
		return shim.Error(err.Error())
	}

	resultOld.PrevIDTransaction = resultOld.IDTransaction
	resultOld.IDTransaction = IDTransaction

	resultOld.Client.Status = Status

	resultJSONasBytes, _ := json.Marshal(resultOld)
	err = stub.PutState(RefID, resultJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (t *ChaincodeDemo) updateReceived(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//
	if len(args) < 3 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	IDTransaction := args[0]
	RefID := args[1]
	Received := args[2]

	resultAsBytes, err := stub.GetState(RefID)
	if err != nil {
		return shim.Error("Failed to get result:" + err.Error())
	} else if resultAsBytes == nil {
		return shim.Error("result does not exist")
	}

	resultOld := Demo{}
	err = json.Unmarshal(resultAsBytes, &resultOld)
	if err != nil {
		return shim.Error(err.Error())
	}

	resultOld.PrevIDTransaction = resultOld.IDTransaction
	resultOld.IDTransaction = IDTransaction

	resultOld.Client.Received = Received

	resultJSONasBytes, _ := json.Marshal(resultOld)
	err = stub.PutState(RefID, resultJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (t *ChaincodeDemo) updateStatusSeller(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//
	if len(args) < 3 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	IDTransaction := args[0]
	RefID := args[1]
	Status := args[2]

	resultAsBytes, err := stub.GetState(RefID)
	if err != nil {
		return shim.Error("Failed to get result:" + err.Error())
	} else if resultAsBytes == nil {
		return shim.Error("result does not exist")
	}

	resultOld := Demo{}
	err = json.Unmarshal(resultAsBytes, &resultOld)
	if err != nil {
		return shim.Error(err.Error())
	}

	resultOld.PrevIDTransaction = resultOld.IDTransaction
	resultOld.IDTransaction = IDTransaction

	resultOld.Seller.Status = Status

	resultJSONasBytes, _ := json.Marshal(resultOld)
	err = stub.PutState(RefID, resultJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (t *ChaincodeDemo) updateShipped(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//
	if len(args) < 3 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	IDTransaction := args[0]
	RefID := args[1]
	Shipped := args[2]

	resultAsBytes, err := stub.GetState(RefID)
	if err != nil {
		return shim.Error("Failed to get result:" + err.Error())
	} else if resultAsBytes == nil {
		return shim.Error("result does not exist")
	}

	resultOld := Demo{}
	err = json.Unmarshal(resultAsBytes, &resultOld)
	if err != nil {
		return shim.Error(err.Error())
	}

	resultOld.PrevIDTransaction = resultOld.IDTransaction
	resultOld.IDTransaction = IDTransaction

	resultOld.Seller.Shipped = Shipped

	resultJSONasBytes, _ := json.Marshal(resultOld)
	err = stub.PutState(RefID, resultJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (t *ChaincodeDemo) getResultByRefID(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	RefID := args[0]
	queryString := fmt.Sprintf("{\"selector\":{\"product\":{\"ref_id\":\"%s\"}}}", RefID)

	queryResults, err := getValueQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

func (t *ChaincodeDemo) getAllProduct(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	queryString := fmt.Sprintf("{\"selector\":{\"_id\":{\"$gt\":null}}}")

	queryResults, err := getValueQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

func getValueQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getValueQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}

func (t *ChaincodeDemo) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Result information Invoke")
	function, args := stub.GetFunctionAndParameters()
	if function == "getResultByRefID" {
		// get
		return t.getResultByRefID(stub, args)
	} else if function == "getAllProduct" {
		// get all
		fmt.Println("getAllProduct")
		return t.getAllProduct(stub, args)
	} else if function == "initContract" {
		// create
		return t.initContract(stub, args)
	} else if function == "updateStatusClient" {
		// update
		return t.updateStatusClient(stub, args)
	} else if function == "updateReceived" {
		// update
		return t.updateReceived(stub, args)
	} else if function == "updateStatusSeller" {
		// update
		return t.updateStatusSeller(stub, args)
	} else if function == "updateShipped" {
		// update
		return t.updateShipped(stub, args)
	} else if function == "updateOrder" {
		// update
		return t.updateOrder(stub, args)
	}

	return shim.Error("Invalid invoke function name")
}

func main() {
	err := shim.Start(new(ChaincodeDemo))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
