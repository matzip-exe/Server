var VisitRecord = function(date, position, bizName, totalCost, numOfPeople){
    this.date = date || null;
    this.position = position  || null;
    this.bizName = bizName || null;
    this.totalCost = totalCost || null;
    this.numOfPeople = numOfPeople || null;
};

/*
VisitRecord.prototype.toJSON = function(){
    return JSON.stringify(this, ["date", "position", "bizName", "totalCost", "numOfPeople"]);
}
*/

module.exports = VisitRecord;

