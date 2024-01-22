using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("DYNAMIC_REGIST_SURVEY_DATA")]
    public class EdmsDynamicData
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string SurveyCode { get; set; }
        public string AttrValue { get; set; }
        public string UserName { get; set; }
    }
    public class EdmsDynamicSearchModel
    {
        public string UserName { get; set; }
        public string GivenName { get; set; }
        public bool? Gender { get; set; }
        public int Correct { get; set; }
        public string Date { get; set; }
        public DateTime DateTime { get; set; }
        public string Values { get; set; }
        public string Id { get; set; }
    }

    public class EdmsDynamicValueModel
    {
        public string Group { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string DataType { get; set; }
        public string Unit { get; set; }
        public object Value { get; set; }
        public string StringValue => DataType == "STRING" && Value != null ? Value.ToString() : "";
        public bool BooleanValue => DataType == "BOOLEAN" && Value != null && (bool)Value;
        public DateTime? DateTimeValue => DataType == "DATETIME" && Value != null ? (DateTime)Value : (DateTime?)null;
        public decimal NumberValue => DataType == "NUMBER" && Value != null ? decimal.Parse(Value.ToString()) : 0;
    }
}
