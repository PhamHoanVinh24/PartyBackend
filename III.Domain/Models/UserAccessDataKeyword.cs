using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("USER_ACCESS_DATA_KEYWORD")]
    public class UserAccessDataKeyword
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string User { get; set; }
        public string Group { get; set; }
        public string KeyWordList { get; set; }
    }
}
