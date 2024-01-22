using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("USER_DO_EXERCISE_RESULT")]
    public class UserDoExerciseResult
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string QuizCode { get; set; }
        public string UserChoose { get; set; }
        public bool? Result { get; set; }
        public string SessionCode { get; set; }
        public string TypeTraining { get; set; }
        public string ObjectCode { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
    }
}
