import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReplayIcon from "@mui/icons-material/Replay";
import DescriptionIcon from "@mui/icons-material/Description";
import ChatIcon from "@mui/icons-material/Chat";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ReportIcon from "@mui/icons-material/Report";

// Counter Component
const Counter = ({ end, label, color }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 100);
    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [end]);

  return (
    <Box
      textAlign="center"
      sx={{
        m: { xs: 1, sm: 2 },
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: `${color}.50`,
        boxShadow: 2,
        minWidth: { xs: 100, sm: 150 },
        flex: { xs: "1 1 40%", sm: "0 1 auto" },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: `${color}.main`,
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.2rem" },
        }}
      >
        {count.toLocaleString()}+
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
      >
        {label}
      </Typography>
    </Box>
  );
};

const MainPage = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const services = [
    {
      title: "إدارة الطلاب",
      text: "📚 مع نظام إدارة الطلاب تقدر تتابع بيانات كل طالب بسهولة ووضوح ✨، بداية من المعلومات الأساسية 👤 وحتى التفاصيل الأكاديمية 🎓. استمتع بواجهة منظمة وسهلة الاستخدام تجعل الإدارة أكثر مرونة ⚡ وتساعدك على توفير الوقت ⏰ والجهد 💪. اكتشف تجربة مختلفة تجعل متابعة الطلاب عملية ممتعة وبسيطة 🌟.",
      icon: <PeopleIcon color="primary" fontSize="large" />,
    },
    {
      title: "تقارير ولوائح",
      text: "📊 أنشئ تقارير ولوائح درجات بشكل أوتوماتيكي وسريع ⚡ دون أي تعقيد. استمتع بنظام ذكي 🤖 يجهز لك البيانات بدقة عالية 🎯 ويوفر وقتك ⏰ وجهدك 💪. من متابعة نتائج الطلاب 🎓 إلى استخراج كشوف شاملة ومنظمة 📑، كل شيء أصبح أسهل مع واجهة بسيطة وواضحة ✨ تمنحك تجربة احترافية وموثوقة 🌟.",
      icon: <AutoGraphIcon color="secondary" fontSize="large" />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4, md: 6 }, mb: 8, px: { xs: 1.5, sm: 3 } }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={{ xs: 6, sm: 8, md: 10 }}>
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
          <Typography
            variant="h3"
            gutterBottom
            color="primary"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
              lineHeight: 1.3,
            }}
          >
            مرحبًا بك في منصّة <span className="text-yellow-500">يا درووس</span>
          </Typography>
          <Typography
            variant="h5"
            color="success.main"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" } }}
          >
            منصة تعليمية وتفاعلية ومجانية
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            paragraph
            sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem" } }}
          >
            تعرّف على خدماتنا التعليمية وابدأ رحلتك بسهولة
          </Typography>

          {/* Buttons */}
          <Box
            mt={{ xs: 3, sm: 4 }}
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="center"
            alignItems="center"
            gap={2}
          >
            <motion.div whileHover={{ scale: 1.05 }} className="w-full sm:w-auto">
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href="/register"
                fullWidth
                sx={{
                  px: { xs: 4, sm: 6 },
                  py: 1.5,
                  fontSize: { xs: "1rem", sm: "1.15rem" },
                  borderRadius: "2rem",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
                }}
              >
                حساب جديد
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="w-full sm:w-auto">
              <Button
                variant="contained"
                color="primary"
                size="large"
                href="/login"
                fullWidth
                sx={{
                  px: { xs: 4, sm: 6 },
                  py: 1.5,
                  fontSize: { xs: "1rem", sm: "1.15rem" },
                  borderRadius: "2rem",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
                }}
              >
                تسجيل الدخول
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Box>

      {/* Services Section */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} mb={{ xs: 6, sm: 8, md: 10 }}>
        {services.map((service, i) => {
          const isExpanded = expandedIndex === i;
          const shortText =
            service.text.length > 120
              ? service.text.slice(0, 120) + "..."
              : service.text;

          return (
            <Grid item xs={12} sm={6} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="h-full"
              >
                <Card sx={{ textAlign: "center", p: { xs: 2, sm: 3 }, boxShadow: 3, borderRadius: 3, height: "100%" }}>
                  <CardContent>
                    {service.icon}
                    <Typography variant="h5" gutterBottom color="primary" sx={{ fontSize: { xs: "1.2rem", sm: "1.4rem" }, fontWeight: "bold" }}>
                      {service.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, lineHeight: 1.7 }}>
                      {isExpanded ? service.text : shortText}
                    </Typography>
                    {service.text.length > 120 && (
                      <Box mt={2}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleToggle(i)}
                        >
                          {isExpanded ? "إخفاء" : "المزيد"}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Teachers Section */}
      <Box textAlign="center" mb={{ xs: 6, sm: 8, md: 10 }}>
        <Typography variant="h4" gutterBottom color="secondary" sx={{ fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2.1rem" }, fontWeight: "bold" }}>
          تعرف على معلمينا
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {["أ. محمد", "أ. علي", "أ. فاطمة"].map((teacher, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <motion.div whileHover={{ scale: 1.03 }}>
                <Card sx={{ p: { xs: 2, sm: 3 }, textAlign: "center", boxShadow: 2, borderRadius: 3 }}>
                  <Avatar
                    sx={{ width: { xs: 60, sm: 75 }, height: { xs: 60, sm: 75 }, mx: "auto", mb: 2, bgcolor: "primary.main" }}
                  >
                    {teacher[0]}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontSize: { xs: "1.1rem", sm: "1.2rem" }, fontWeight: "bold" }}>{teacher}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                    مدرس مادة متخصصة
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Statistics Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          mb: { xs: 6, sm: 8, md: 10 },
        }}
      >
        <Counter end={5000} label="عدد الطلاب" color="primary" />
        <Counter end={1200} label="عدد الدروس" color="secondary" />
        <Counter end={200} label="عدد المدرسين" color="success" />
      </Box>

      {/* Why Us Section */}
      <Box mb={{ xs: 6, sm: 8 }}>
        <Typography
          variant="h4"
          gutterBottom
          textAlign="center"
          color="primary"
          sx={{
            fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2.1rem" },
            fontWeight: "bold",
            mb: { xs: 3, sm: 4 },
          }}
        >
          ليه منصة يا دروس التعليمية؟
        </Typography>
        <Grid container spacing={{ xs: 1.5, sm: 2.5, md: 3 }}>
          {[
            { icon: <OndemandVideoIcon color="primary" />, text: "فيديوهات شرح شاملة لكل جزء في المنهج" },
            { icon: <AssignmentIcon color="secondary" />, text: "تمارين وواجبات تفاعلية بعد كل حصة" },
            { icon: <ReplayIcon color="success" />, text: "مراجعات شاملة ومكثفة قبل الامتحانات" },
            { icon: <DescriptionIcon color="warning" />, text: "ملخصات جاهزة للطباعة لكل حصة" },
            { icon: <ChatIcon color="error" />, text: "تواصل مباشر مع المدرسين للإجابة عن أسئلتك" },
            { icon: <EventNoteIcon color="info" />, text: "جداول مذاكرة يومية منظمة لكل المواد" },
            { icon: <ReportIcon color="secondary" />, text: "تقارير شهرية دقيقة لمتابعة مستواك" },
            { icon: <PeopleIcon color="success" />, text: "سهولة الاستخدام والتنقل" },
            { icon: <SchoolIcon color="primary" />, text: "منصة مجانية بالكامل" },
            { icon: <SupportAgentIcon color="error" />, text: "دعم فني مستمر ومتجاوب" },
          ].map((item, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderRadius: "1rem",
                    background: "linear-gradient(145deg, #ffffff, #f7f9fc)",
                    boxShadow: "2px 2px 8px rgba(0,0,0,0.06)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "4px 4px 12px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {item.icon}
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, fontWeight: 500 }}>
                    {item.text}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default MainPage;
