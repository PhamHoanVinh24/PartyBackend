using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_ALL_TABLE")]
    public class VTableName
    {
        [Key]
        public Guid Id { get; set; }
        public string TableName { get; set; }
        [NotMapped]
        public bool IsCheck { get; set; }
    }

    public class ResultBackup
    {
        public int Result { get; set; }
    }
}
