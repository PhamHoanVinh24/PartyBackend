using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("JOBCARD_DATA_LOGGER")]
    public class JobcardDataLogger
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string DtCode { get; set; }

        public string DtTitle { get; set; }

        public string DtValue { get; set; }

        public string DtUnit { get; set; }

        public string DtGroup { get; set; }

        public string DtValueType { get; set; }

        public string ShiftCode { get; set; }

        public string ItemList { get; set; }

        public string JobcardCode { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        public bool Flag { get; set; }

        public string ActInstCode { get; set; }

        public string WfInstCode { get; set; }

        public string SessionId { get; set; }
        public string SessionCode { get; set; }
        [NotMapped]
        public string DtType { get; set; }
    }
}
