using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PO_CUS_ATTRIBUTE")]
    public class PoCusAttribute
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Code { get;set; }
        public string Value { get; set; }
        public string Group { get; set; }
        public string PoCusCode { get; set; }
        public string Noted { get; set; }

    }
}
